export interface Changelog {
  releases: ChangelogRelease[];
}

export interface ChangelogRelease {
  version: string;
  date: string;
  commitGroups: ChangelogCommitGroup[];
  compareUrl?: string;
}

export interface ChangelogCommitGroup {
  title: string;
  type: string;
  commits: ChangelogCommit[];
}

export interface ChangelogCommit {
  subject: string;
  hash: string;
  commitUrl?: string;
  scope?: string;
}
