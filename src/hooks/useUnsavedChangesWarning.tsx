import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate, UNSAFE_NavigationContext } from 'react-router-dom';
import { useContext } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UseUnsavedChangesWarningProps {
    hasUnsavedChanges: boolean;
    onSave?: () => Promise<void>;
}

export function useUnsavedChangesWarning({
    hasUnsavedChanges,
    onSave
}: UseUnsavedChangesWarningProps) {
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [nextLocation, setNextLocation] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const navigator = useContext(UNSAFE_NavigationContext).navigator;
    const originalPushRef = useRef(navigator.push);

    // 브라우저 새로고침/닫기 방지
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // 라우터 네비게이션 감지
    useEffect(() => {
        if (!hasUnsavedChanges || isNavigating) {
            // 변경사항이 없거나 네비게이션 중이면 원래 push 사용
            navigator.push = originalPushRef.current;
            return;
        }

        // 네비게이션 가로채기
        navigator.push = (...args: any[]) => {
            const [to] = args;
            let targetPath = '';

            if (typeof to === 'string') {
                targetPath = to;
            } else if (typeof to === 'object' && to.pathname) {
                targetPath = to.pathname;
            }

            if (targetPath && targetPath !== location.pathname) {
                setNextLocation(targetPath);
                setShowBlockDialog(true);
            } else {
                originalPushRef.current.apply(navigator, args);
            }
        };

        return () => {
            navigator.push = originalPushRef.current;
        };
    }, [hasUnsavedChanges, location.pathname, navigator, isNavigating]);

    const handleLeave = useCallback(() => {
        setShowBlockDialog(false);
        setIsNavigating(true);

        if (nextLocation) {
            // 원래 push 함수 복원 후 이동
            navigator.push = originalPushRef.current;
            setTimeout(() => {
                navigate(nextLocation);
                setNextLocation(null);
                setIsNavigating(false);
            }, 0);
        }
    }, [nextLocation, navigate, navigator]);

    const handleStay = useCallback(() => {
        setShowBlockDialog(false);
        setNextLocation(null);
    }, []);

    const handleSaveAndLeave = useCallback(async () => {
        if (onSave && nextLocation) {
            try {
                await onSave();
                setShowBlockDialog(false);
                setIsNavigating(true);

                // 저장 성공 후 이동
                navigator.push = originalPushRef.current;
                setTimeout(() => {
                    navigate(nextLocation);
                    setNextLocation(null);
                    setIsNavigating(false);
                }, 100); // 저장 완료 후 약간의 딜레이
            } catch (error) {
                console.error('Save failed:', error);
                setIsNavigating(false);
                // 저장 실패 시 모달 유지
            }
        }
    }, [onSave, nextLocation, navigate, navigator]);

    const WarningDialog = useCallback(() => (
        <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>저장하지 않은 변경사항이 있습니다</AlertDialogTitle>
                    <AlertDialogDescription>
                        페이지를 벗어나면 변경사항이 모두 사라집니다.
                        정말로 이 페이지를 벗어나시겠습니까?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleStay}>
                        취소
                    </AlertDialogCancel>
                    {onSave && (
                        <AlertDialogAction
                            onClick={handleSaveAndLeave}
                            className="bg-primary"
                        >
                            저장하고 나가기
                        </AlertDialogAction>
                    )}
                    <AlertDialogAction
                        onClick={handleLeave}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        저장 안 함
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ), [showBlockDialog, handleStay, handleLeave, handleSaveAndLeave, onSave]);

    return { WarningDialog };
}