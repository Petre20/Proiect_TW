export function isLocalPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')
}

export function safeNext(next: string | null | undefined): string {
  return isLocalPath(next) ? next : '/dashboard'
}
