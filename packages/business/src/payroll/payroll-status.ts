export function getPayrollStatusMessage(isClosed: boolean, lineCount: number) {
  return isClosed
    ? `Lönekörningen är låst med ${lineCount} rader.`
    : `Lönekörningen är öppen och innehåller ${lineCount} rader.`;
}
