import { Body, Controller, Delete, Get, MessageEvent, Param, Patch, Post, Put, Query, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';

import { BackofficeService } from './backoffice.service';
import type {
  AddBackofficeMessageInput,
  CreateBackofficeThreadInput,
  UpsertBackofficeCapacityProfileInput,
  UpsertBackofficeRebalancePolicyInput,
  UpsertBackofficeSlaPolicyInput
} from './backoffice-ops.types';
import type {
  AddCaseCommentInput,
  AssignCaseInput,
  BackofficeRole,
  CloseCaseInput,
  CreateCaseInput,
  CreateRuleValueInput,
  CreateRuleUpdateCandidateInput,
  SaveWorkspaceSessionStateInput,
  EscalateCaseInput,
  MarkCaseWaitingForCustomerInput,
  ResolveCaseInput,
  SaveWorkspaceLayoutPreferenceInput,
  UpdateBackofficeUserAccessInput,
  UpdateRuleValueInput
} from './backoffice.types';
import type { BackofficeRealtimeEventType } from './backoffice-realtime.types';

@Controller('backoffice')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('cases')
  listCases(
    @Query('role') role?: BackofficeRole,
    @Query('userId') userId?: string,
    @Query('escalated') escalated?: string
  ) {
    if (userId) {
      return this.backofficeService.getMyAssignedCases(userId);
    }

    if (role && escalated === 'true') {
      return this.backofficeService.getEscalatedCases(role);
    }

    if (role) {
      return this.backofficeService.getCasesForRole(role);
    }

    return this.backofficeService.getCases();
  }

  @Get('cases/summary/open')
  getOpenCasesSummary() {
    return this.backofficeService.getOpenCasesSummary();
  }

  @Get('operations/overview')
  getOperationsOverview(@Query('role') role?: BackofficeRole) {
    return this.backofficeService.getOperationsOverview(role);
  }

  @Get('operations/executive')
  getExecutiveDashboard() {
    return this.backofficeService.getExecutiveDashboard();
  }

  @Get('company-profiles')
  listCompanyProfiles(@Query('role') role?: BackofficeRole) {
    return this.backofficeService.getCompanyProfiles(role);
  }

  @Get('company-profiles/:companyId')
  getCompanyProfile(@Param('companyId') companyId: string, @Query('role') role?: BackofficeRole) {
    return this.backofficeService.getCompanyProfile(companyId, role);
  }

  @Get('sla-policies')
  listSlaPolicies() {
    return this.backofficeService.getSlaPolicies();
  }

  @Post('sla-policies')
  saveSlaPolicy(@Body() body: UpsertBackofficeSlaPolicyInput) {
    return this.backofficeService.saveSlaPolicy(body);
  }

  @Get('capacity-profiles')
  listCapacityProfiles() {
    return this.backofficeService.getCapacityProfiles();
  }

  @Post('capacity-profiles')
  saveCapacityProfile(@Body() body: UpsertBackofficeCapacityProfileInput) {
    return this.backofficeService.saveCapacityProfile(body);
  }

  @Get('rebalance-policies')
  listRebalancePolicies() {
    return this.backofficeService.getRebalancePolicies();
  }

  @Post('rebalance-policies')
  saveRebalancePolicy(@Body() body: UpsertBackofficeRebalancePolicyInput) {
    return this.backofficeService.saveRebalancePolicy(body);
  }

  @Get('rebalance-jobs')
  listRebalanceJobs() {
    return this.backofficeService.getRebalanceJobs();
  }

  @Get('rebalance-jobs/:jobId')
  getRebalanceJob(@Param('jobId') jobId: string) {
    return this.backofficeService.getRebalanceJob(jobId);
  }

  @Post('rebalance-jobs/run')
  runRebalanceJob(
    @Body()
    body: {
      companyId?: string;
      roleKey?: BackofficeRole;
      mode: 'dry_run' | 'suggest' | 'execute';
      triggeredByUserId?: string;
      dryRun?: boolean;
    }
  ) {
    return this.backofficeService.runRebalanceJob(body);
  }

  @Get('threads')
  listThreads(@Query('companyId') companyId?: string) {
    return this.backofficeService.getThreads(companyId);
  }

  @Get('customer-threads')
  listCustomerThreads(@Query('companyId') companyId: string) {
    return this.backofficeService.getCustomerThreads(companyId);
  }

  @Get('threads/by-case/:caseId')
  getThreadByCase(@Param('caseId') caseId: string) {
    return this.backofficeService.getThreadByCase(caseId);
  }

  @Get('threads/:threadId')
  getThread(@Param('threadId') threadId: string) {
    return this.backofficeService.getThread(threadId);
  }

  @Get('customer-threads/:threadId')
  getCustomerThread(@Param('threadId') threadId: string, @Query('companyId') companyId: string) {
    return this.backofficeService.getCustomerThread(threadId, companyId);
  }

  @Post('threads')
  createThread(@Body() body: CreateBackofficeThreadInput) {
    return this.backofficeService.createThread(body);
  }

  @Post('threads/:threadId/messages')
  addThreadMessage(@Param('threadId') threadId: string, @Body() body: Omit<AddBackofficeMessageInput, 'threadId'>) {
    return this.backofficeService.addThreadMessage({
      ...body,
      threadId
    });
  }

  @Post('threads/:threadId/read')
  markThreadRead(@Param('threadId') threadId: string, @Body() body: { userId?: string }) {
    return this.backofficeService.markThreadRead(threadId, body.userId);
  }

  @Post('customer-threads/:threadId/messages')
  addCustomerThreadMessage(
    @Param('threadId') threadId: string,
    @Body() body: { companyId: string; body: string; senderUserId?: string; senderEmail?: string; senderDisplayName?: string }
  ) {
    return this.backofficeService.addCustomerThreadMessage({
      threadId,
      companyId: body.companyId,
      body: body.body,
      senderUserId: body.senderUserId,
      senderEmail: body.senderEmail,
      senderDisplayName: body.senderDisplayName
    });
  }

  @Post('customer-threads/:threadId/read')
  markCustomerThreadRead(@Param('threadId') threadId: string, @Body() body: { companyId: string }) {
    return this.backofficeService.markCustomerThreadRead(threadId, body.companyId);
  }

  @Sse('events/stream')
  streamRealtimeEvents(
    @Query('companyId') companyId?: string,
    @Query('role') role?: BackofficeRole,
    @Query('threadId') threadId?: string,
    @Query('caseId') caseId?: string,
    @Query('types') types?: string
  ): Observable<MessageEvent> {
    return this.backofficeService.streamRealtimeEvents({
      companyId,
      role,
      threadId,
      caseId,
      types: types
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) as BackofficeRealtimeEventType[] | undefined
    });
  }

  @Get('cases/:caseId')
  getCase(@Param('caseId') caseId: string) {
    return this.backofficeService.getCase(caseId);
  }

  @Post('cases')
  createCase(@Body() body: CreateCaseInput) {
    return this.backofficeService.createCase(body);
  }

  @Post('cases/:caseId/assign')
  assignCase(@Param('caseId') caseId: string, @Body() body: AssignCaseInput) {
    return this.backofficeService.assignCase(caseId, body);
  }

  @Post('cases/:caseId/escalate')
  escalateCase(@Param('caseId') caseId: string, @Body() body: EscalateCaseInput) {
    return this.backofficeService.escalateCase(caseId, body);
  }

  @Post('cases/:caseId/resolve')
  resolveCase(@Param('caseId') caseId: string, @Body() body: ResolveCaseInput) {
    return this.backofficeService.resolveCase(caseId, body);
  }

  @Post('cases/:caseId/close')
  closeCase(@Param('caseId') caseId: string, @Body() body: CloseCaseInput) {
    return this.backofficeService.closeCase(caseId, body);
  }

  @Post('cases/:caseId/waiting-for-customer')
  markCaseWaitingForCustomer(
    @Param('caseId') caseId: string,
    @Body() body: MarkCaseWaitingForCustomerInput
  ) {
    return this.backofficeService.markCaseWaitingForCustomer(caseId, body);
  }

  @Post('cases/:caseId/comments')
  addCaseComment(@Param('caseId') caseId: string, @Body() body: AddCaseCommentInput) {
    return this.backofficeService.addCaseComment(caseId, body);
  }

  @Get('role-context')
  getRoleContext(
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('fallbackRole') fallbackRole?: BackofficeRole
  ) {
    return this.backofficeService.getRoleContext({
      userId,
      email,
      fallbackRole
    });
  }

  @Get('role-users')
  listBackofficeUsers() {
    return this.backofficeService.listBackofficeUsers();
  }

  @Put('role-users/:userId')
  updateBackofficeUserAccess(
    @Param('userId') userId: string,
    @Body() body: UpdateBackofficeUserAccessInput
  ) {
    return this.backofficeService.updateBackofficeUserAccess(userId, body);
  }

  @Get('rule-update-candidates')
  listRuleUpdateCandidates() {
    return this.backofficeService.getRuleUpdateCandidates();
  }

  @Post('rule-update-candidates')
  createRuleUpdateCandidate(@Body() body: CreateRuleUpdateCandidateInput) {
    return this.backofficeService.createRuleUpdateCandidate(body);
  }

  @Post('rule-update-candidates/:candidateId/dismiss')
  dismissRuleUpdateCandidate(@Param('candidateId') candidateId: string) {
    return this.backofficeService.dismissRuleUpdateCandidate(candidateId);
  }

  @Post('rule-update-candidates/:candidateId/convert')
  convertRuleUpdateCandidate(@Param('candidateId') candidateId: string) {
    return this.backofficeService.convertCandidateToCase(candidateId);
  }

  @Get('rules/active')
  getActiveRuleValue(@Query('ruleKey') ruleKey: string, @Query('date') date?: string) {
    return this.backofficeService.getActiveRuleValue(ruleKey, date);
  }

  @Get('rules/active-many')
  getActiveRuleValues(@Query('ruleKeys') ruleKeys: string, @Query('date') date?: string) {
    return this.backofficeService.getActiveRuleValues(
      ruleKeys
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      date
    );
  }

  @Get('workspace-layout')
  getWorkspaceLayout(
    @Query('userId') userId: string,
    @Query('companyId') companyId: string,
    @Query('roleKey') roleKey: 'admin' | 'ekonomi' | 'projektledare'
  ) {
    return this.backofficeService.getResolvedWorkspaceLayout(userId, companyId, roleKey);
  }

  @Put('workspace-layout')
  saveWorkspaceLayout(@Body() body: SaveWorkspaceLayoutPreferenceInput) {
    return this.backofficeService.saveWorkspaceLayoutPreference(body);
  }

  @Delete('workspace-layout')
  clearWorkspaceLayout(
    @Query('userId') userId: string,
    @Query('companyId') companyId: string,
    @Query('roleKey') roleKey: 'admin' | 'ekonomi' | 'projektledare'
  ) {
    return this.backofficeService.clearWorkspaceLayoutPreference(userId, companyId, roleKey);
  }

  @Get('workspace-session')
  getWorkspaceSession(
    @Query('userId') userId: string,
    @Query('companyId') companyId: string,
    @Query('roleKey') roleKey: 'admin' | 'ekonomi' | 'projektledare'
  ) {
    return this.backofficeService.getResolvedWorkspaceSession(userId, companyId, roleKey);
  }

  @Put('workspace-session')
  saveWorkspaceSession(@Body() body: SaveWorkspaceSessionStateInput) {
    return this.backofficeService.saveWorkspaceSessionState(body);
  }

  @Delete('workspace-session')
  clearWorkspaceSession(
    @Query('userId') userId: string,
    @Query('companyId') companyId: string,
    @Query('roleKey') roleKey: 'admin' | 'ekonomi' | 'projektledare'
  ) {
    return this.backofficeService.clearWorkspaceSessionState(userId, companyId, roleKey);
  }

  @Get('rules')
  listRuleValues() {
    return this.backofficeService.getRuleValues();
  }

  @Get('rules/:ruleId')
  getRuleValue(@Param('ruleId') ruleId: string) {
    return this.backofficeService.getRuleValue(ruleId);
  }

  @Post('rules')
  createRuleValue(@Body() body: CreateRuleValueInput) {
    return this.backofficeService.createRuleValue(body);
  }

  @Patch('rules/:ruleId')
  updateRuleValue(@Param('ruleId') ruleId: string, @Body() body: UpdateRuleValueInput) {
    return this.backofficeService.updateRuleValue(ruleId, body);
  }

  @Get('audit-log')
  getAuditLog() {
    return this.backofficeService.getAuditLog();
  }
}
