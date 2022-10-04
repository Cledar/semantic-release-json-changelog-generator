export interface ConventionalChangelogRelease {
  version: string;
  currentTag: string;
  previousTag?: string;
  date: string;
  host: string;
  owner: string;
  repository: string;
  commitGroups: ConventionalChangelogCommitGroup[];
  hash: string;
}

export interface ConventionalChangelogCommitGroup {
  title: string;
  commits: ConventionalChangelogCommit[];
}

export interface ConventionalChangelogCommit {
  header: string;
  subject: string;
  scope: string;
  shortHash: string;
  hash: string;
  raw: ConventionalChangelogCommitRaw;
}

export interface ConventionalChangelogCommitRaw {
  scope: string;
  subject: string;
  type: string;
}
