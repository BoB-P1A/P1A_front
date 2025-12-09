import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Filter, X, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface HistoryLog {
    _id: string;
    companyId: string;
    area: string;
    field: string;
    subField: string;
    no: string;
    item: string;
    evaluationType: 'lifecycle' | 'technical' | 'security';
    targetId: string;
    targetName: string;
    previousStatus: '이행' | '부분이행' | '미이행' | '해당없음' | null;
    newStatus: '이행' | '부분이행' | '미이행' | '해당없음';
    previousEvidence: string | null;
    newEvidence: string;
    changedBy: {
        accountId: string;
        loginId: string;
        name: string;
    };
    changedAt: string;
    action?: {
        plan: string;
        department: string;
        owner: string;
        actionDate: string;
    };
}

interface FilterOptions {
    areas: string[];
    targetNames: string[];
    changedByNames: string[];
}

export default function HistoryLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<HistoryLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<HistoryLog | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    // 필터 옵션
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        areas: [],
        targetNames: [],
        changedByNames: [],
    });

    // 필터 상태
    const [filters, setFilters] = useState({
        area: 'all',
        no: '',
        targetName: 'all',
        previousStatus: 'all',
        newStatus: 'all',
        changedByName: 'all',
        changedAtFrom: '',
        changedAtTo: '',
    });

    // 적용된 필터 (실제 검색에 사용)
    const [appliedFilters, setAppliedFilters] = useState({ ...filters });

    // 페이지네이션
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
    });

    // 필터 옵션 로드
    useEffect(() => {
        if (!user?.companyId) return;

        const loadFilterOptions = async () => {
            try {
                const options = await api.historyLogs.getFilterOptions(user.companyId!);
                setFilterOptions(options);
            } catch (error) {
                console.error('Failed to load filter options:', error);
            }
        };

        loadFilterOptions();
    }, [user?.companyId]);

    // 로그 기록 로드
    useEffect(() => {
        if (!user?.companyId) return;
        loadHistoryLogs();
    }, [user?.companyId, appliedFilters, pagination.page]);

    const loadHistoryLogs = async () => {
        if (!user?.companyId) return;

        try {
            setLoading(true);

            // 'all'과 빈 문자열 필터 제거
            const cleanedFilters: Record<string, string> = {};
            Object.entries(appliedFilters).forEach(([key, value]) => {
                if (value !== '' && value !== 'all') {
                    // 날짜 필터에 시간 정보 추가
                    if (key === 'changedAtFrom' && value) {
                        cleanedFilters[key] = `${value}T00:00:00`;  // 시작일: 00:00:00
                    } else if (key === 'changedAtTo' && value) {
                        cleanedFilters[key] = `${value}T23:59:59`;  // 종료일: 23:59:59
                    } else {
                        cleanedFilters[key] = value;
                    }
                }
            });

            const response = await api.historyLogs.getAll({
                companyId: user.companyId,
                ...cleanedFilters,
                page: pagination.page,
                pageSize: pagination.pageSize,
            });

            setLogs(response.items || []);
            setPagination({
                ...pagination,
                total: response.total,
                totalPages: response.totalPages,
            });
        } catch (error) {
            console.error('Failed to load history logs:', error);
            toast({
                title: '데이터 로딩 실패',
                description: '로그 기록을 불러오는데 실패했습니다.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setAppliedFilters({ ...filters });
        setPagination({ ...pagination, page: 1 });
        setShowFilterDialog(false);
        toast({ title: '필터가 적용되었습니다' });
    };

    const handleResetFilters = () => {
        const resetFilters = {
            area: 'all',
            no: '',
            targetName: 'all',
            previousStatus: 'all',
            newStatus: 'all',
            changedByName: 'all',
            changedAtFrom: '',
            changedAtTo: '',
        };
        setFilters(resetFilters);
        setAppliedFilters(resetFilters);
        setPagination({ ...pagination, page: 1 });
        toast({ title: '필터가 초기화되었습니다' });
    };

    const getActiveFilterCount = () => {
        return Object.values(appliedFilters).filter(v => v !== '' && v !== 'all').length;
    };

    const getStatusBadgeVariant = (status: string | null) => {
        switch (status) {
            case '이행': return 'default';
            case '부분이행': return 'secondary';
            case '미이행': return 'destructive';
            case '해당없음': return 'outline';
            default: return 'outline';
        }
    };

    const getEvaluationTypeLabel = (type: string) => {
        switch (type) {
            case 'lifecycle': return '처리단계';
            case 'technical': return '처리시스템';
            case 'security': return '보안성검토';
            default: return type;
        }
    };

    const handleViewDetail = (log: HistoryLog) => {
        setSelectedLog(log);
        setShowDetailDialog(true);
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">로그 기록</h1>
                    <p className="text-muted-foreground mt-2">
                        체크리스트 평가 결과 변경 이력을 조회합니다
                    </p>
                </div>
                <div className="flex gap-2">
                    {getActiveFilterCount() > 0 && (
                        <Button variant="outline" onClick={handleResetFilters}>
                            <X className="mr-2 h-4 w-4" />
                            필터 초기화
                        </Button>
                    )}
                    <Button onClick={() => setShowFilterDialog(true)}>
                        <Filter className="mr-2 h-4 w-4" />
                        필터 {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
                    </Button>
                </div>
            </div>

            {/* 로그 기록 테이블 */}
            <Card>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">조회된 로그 기록이 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>평가영역</TableHead>
                                        <TableHead>항목번호</TableHead>
                                        <TableHead>평가대상</TableHead>
                                        {/*<TableHead>평가유형</TableHead>*/}
                                        <TableHead>이전상태</TableHead>
                                        <TableHead>변경상태</TableHead>
                                        <TableHead>변경자</TableHead>
                                        <TableHead>변경일시</TableHead>
                                        <TableHead className="text-right">작업</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell className="font-medium">{log.area}</TableCell>
                                            <TableCell>{log.no}</TableCell>
                                            <TableCell>{log.targetName}</TableCell>
                                            {/*<TableCell>*/}
                                            {/*    <Badge variant="outline">*/}
                                            {/*        {getEvaluationTypeLabel(log.evaluationType)}*/}
                                            {/*    </Badge>*/}
                                            {/*</TableCell>*/}
                                            <TableCell>
                                                {log.previousStatus ? (
                                                    <Badge variant={getStatusBadgeVariant(log.previousStatus)}>
                                                        {log.previousStatus}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">최초 입력</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(log.newStatus)}>
                                                    {log.newStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{log.changedBy.name}</TableCell>
                                            <TableCell>{formatDate(log.changedAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(log)}
                                                >
                                                    상세보기
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* 페이지네이션 */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    전체 {pagination.total}개 중 {((pagination.page - 1) * pagination.pageSize) + 1}-
                                    {Math.min(pagination.page * pagination.pageSize, pagination.total)}개 표시
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    >
                                        이전
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page >= pagination.totalPages}
                                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    >
                                        다음
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* 필터 다이얼로그 */}
            <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>필터 설정</DialogTitle>
                        <DialogDescription>
                            원하는 조건을 선택하여 로그 기록을 필터링합니다
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* 평가영역 / 항목번호 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>평가영역</Label>
                                <Select
                                    value={filters.area}
                                    onValueChange={(value) => setFilters({ ...filters, area: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="전체" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">전체</SelectItem>
                                        {filterOptions.areas.map((area) => (
                                            <SelectItem key={area} value={area}>
                                                {area}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>항목번호</Label>
                                <Input
                                    placeholder="예: 1.1.1"
                                    value={filters.no}
                                    onChange={(e) => setFilters({ ...filters, no: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* 평가대상 / 변경자 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>평가대상</Label>
                                <Select
                                    value={filters.targetName}
                                    onValueChange={(value) => setFilters({ ...filters, targetName: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="전체" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">전체</SelectItem>
                                        {filterOptions.targetNames.map((name) => (
                                            <SelectItem key={name} value={name}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>변경자</Label>
                                <Select
                                    value={filters.changedByName}
                                    onValueChange={(value) => setFilters({ ...filters, changedByName: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="전체" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">전체</SelectItem>
                                        {filterOptions.changedByNames.map((name) => (
                                            <SelectItem key={name} value={name}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 이전 상태 / 변경 상태 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>이전 상태</Label>
                                <Select
                                    value={filters.previousStatus}
                                    onValueChange={(value) => setFilters({ ...filters, previousStatus: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="전체" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">전체</SelectItem>
                                        <SelectItem value="이행">이행</SelectItem>
                                        <SelectItem value="부분이행">부분이행</SelectItem>
                                        <SelectItem value="미이행">미이행</SelectItem>
                                        <SelectItem value="해당없음">해당없음</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>변경 상태</Label>
                                <Select
                                    value={filters.newStatus}
                                    onValueChange={(value) => setFilters({ ...filters, newStatus: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="전체" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">전체</SelectItem>
                                        <SelectItem value="이행">이행</SelectItem>
                                        <SelectItem value="부분이행">부분이행</SelectItem>
                                        <SelectItem value="미이행">미이행</SelectItem>
                                        <SelectItem value="해당없음">해당없음</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 변경일시 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>변경일시 (시작)</Label>
                                <Input
                                    type="date"
                                    value={filters.changedAtFrom}
                                    onChange={(e) => setFilters({ ...filters, changedAtFrom: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>변경일시 (종료)</Label>
                                <Input
                                    type="date"
                                    value={filters.changedAtTo}
                                    onChange={(e) => setFilters({ ...filters, changedAtTo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                                취소
                            </Button>
                            <Button onClick={handleApplyFilters}>
                                <Search className="mr-2 h-4 w-4" />
                                적용
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 상세 정보 다이얼로그 */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>로그 기록 상세 정보</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">평가영역</Label>
                                    <p className="text-sm mt-1">{selectedLog.area}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">평가분야</Label>
                                    <p className="text-sm mt-1">{selectedLog.field}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">세부분야</Label>
                                    <p className="text-sm mt-1">{selectedLog.subField}</p>
                                </div>
                                <div>
                                    <Label className="font-semibold">항목번호</Label>
                                    <p className="text-sm mt-1">{selectedLog.no}</p>
                                </div>
                            </div>

                            <div>
                                <Label className="font-semibold">평가항목</Label>
                                <p className="text-sm mt-1">{selectedLog.item}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-semibold">평가유형</Label>
                                    <p className="text-sm mt-1">
                                        <Badge variant="outline">
                                            {getEvaluationTypeLabel(selectedLog.evaluationType)}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Label className="font-semibold">평가대상</Label>
                                    <p className="text-sm mt-1">{selectedLog.targetName}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">평가 결과 변경</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="font-semibold">이전 상태</Label>
                                        <p className="text-sm mt-1">
                                            {selectedLog.previousStatus ? (
                                                <Badge variant={getStatusBadgeVariant(selectedLog.previousStatus)}>
                                                    {selectedLog.previousStatus}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">최초 입력</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="font-semibold">변경 상태</Label>
                                        <p className="text-sm mt-1">
                                            <Badge variant={getStatusBadgeVariant(selectedLog.newStatus)}>
                                                {selectedLog.newStatus}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">평가 근거 및 의견</h3>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="font-semibold">변경 전 평가 근거 및 의견</Label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded">
                                            {selectedLog.previousEvidence || '(없음)'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="font-semibold">변경 후 평가 근거 및 의견</Label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded">
                                            {selectedLog.newEvidence || '(없음)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-3">변경자 정보</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label className="font-semibold">이름</Label>
                                        <p className="text-sm mt-1">{selectedLog.changedBy.name}</p>
                                    </div>
                                    <div>
                                        <Label className="font-semibold">아이디</Label>
                                        <p className="text-sm mt-1">{selectedLog.changedBy.loginId}</p>
                                    </div>
                                    <div>
                                        <Label className="font-semibold">변경일시</Label>
                                        <p className="text-sm mt-1">{formatDate(selectedLog.changedAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/*{selectedLog.action && (*/}
                            {/*    <div className="border-t pt-4">*/}
                            {/*        <h3 className="font-semibold mb-3">조치 정보</h3>*/}
                            {/*        <div className="space-y-3">*/}
                            {/*            <div>*/}
                            {/*                <Label className="font-semibold">조치 계획</Label>*/}
                            {/*                <p className="text-sm mt-1 p-3 bg-muted rounded">*/}
                            {/*                    {selectedLog.action.plan}*/}
                            {/*                </p>*/}
                            {/*            </div>*/}
                            {/*            <div className="grid grid-cols-3 gap-4">*/}
                            {/*                <div>*/}
                            {/*                    <Label className="font-semibold">조치 부서</Label>*/}
                            {/*                    <p className="text-sm mt-1">{selectedLog.action.department}</p>*/}
                            {/*                </div>*/}
                            {/*                <div>*/}
                            {/*                    <Label className="font-semibold">조치 담당자</Label>*/}
                            {/*                    <p className="text-sm mt-1">{selectedLog.action.owner}</p>*/}
                            {/*                </div>*/}
                            {/*                <div>*/}
                            {/*                    <Label className="font-semibold">조치 일시</Label>*/}
                            {/*                    <p className="text-sm mt-1">*/}
                            {/*                        {selectedLog.action.actionDate*/}
                            {/*                            ? formatDate(selectedLog.action.actionDate)*/}
                            {/*                            : '-'}*/}
                            {/*                    </p>*/}
                            {/*                </div>*/}
                            {/*            </div>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*)}*/}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}