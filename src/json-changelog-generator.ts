import fs from 'fs';
import Handlebars from 'handlebars';
import conventionalChangelog, { Options } from 'conventional-changelog';
import { Context, NextRelease } from 'semantic-release';
import { Changelog, ChangelogRelease, ChangelogCommitGroup, ChangelogCommit } from './models/changelog';
import { ConventionalChangelogRelease, ConventionalChangelogCommitGroup, ConventionalChangelogCommit } from './models/conventional-changelog-output';
import { PluginConfig } from './models/plugin-config';
import { GitProviders } from './models/git-providers';

export class JsonChangelogGenerator {
  private readonly defaultPluginConfig: PluginConfig = {
    changelogName: 'CHANGELOG.json',
    indent: 2,
    debug: false,
    dryRun: false,
    linkReferences: true
  }
  private readonly pluginConfig: PluginConfig;
  private readonly conventionalChangelogStream: NodeJS.ReadableStream;
  private changelogExists = false;

  constructor(pluginConfig: Partial<PluginConfig>, nextRelease: NextRelease, private readonly logger: Context['logger']) {
    this.pluginConfig = {...this.defaultPluginConfig, ...pluginConfig}
    
    const conventionalChangelogOptions: Options = {
      preset: 'angular'
    }

    if (fs.existsSync(this.pluginConfig.changelogName)) {
      this.changelogExists = true;
    } else {
      conventionalChangelogOptions.releaseCount = 0;
    }

    Handlebars.registerHelper(
      'process',
      data => {
        const release = this.getProcessedRelease(data);
        const stringifiedRelease = JSON.stringify(release);
        return new Handlebars.SafeString(stringifiedRelease);
      }
    );

    this.conventionalChangelogStream = conventionalChangelog(
      conventionalChangelogOptions,
      {
        version: nextRelease.version
      },
      null,
      null,
      {
        mainTemplate: '{{process @root}}'
      }
    );
  }

  public async generateChangelog(): Promise<void> {
    const releasesToUpdate = await this.getReleasesToUpdate();
  
    if (this.pluginConfig.debug) {
      this.logger.log(`Releases to update: ${JSON.stringify(releasesToUpdate, null, 2)}`);
    }

    if (releasesToUpdate) {
      const currentReleases = await this.getCurrentReleases();
      const releases: Changelog = {
        releases: [...releasesToUpdate, ...currentReleases]
      }

      const operation = this.changelogExists ? 'Update' : 'Create';
      this.logger.log(`${operation} ${this.pluginConfig.changelogName}.`);

      const content = JSON.stringify(releases, null, this.pluginConfig.indent);

      if (this.pluginConfig.dryRun) {
        this.logger.log(`Changelog content: ${content}`);
      } else {
        await fs.promises.writeFile(this.pluginConfig.changelogName, content);
      }
    }
  }

  private async getCurrentReleases(): Promise<ChangelogRelease[]> {
    if (this.changelogExists) {
      const changelogFile: string = await fs.promises.readFile(this.pluginConfig.changelogName, 'utf-8');
      const changelog: Changelog = JSON.parse(changelogFile);

      return changelog.releases;
    }
    return [];
  }

  private async getReleasesToUpdate(): Promise<ChangelogRelease[]> {
    const chunks: Buffer[] = [];
  
    for await (const chunk of this.conventionalChangelogStream) {
      chunks.push(Buffer.from(chunk));
    }

    return chunks.map(chunk => JSON.parse(chunk.toString('utf-8')));
  }

  private getProcessedRelease(conventionalChangelogRelease: ConventionalChangelogRelease): ChangelogRelease {    
    if (this.pluginConfig.debug) {
      this.logger.log(`Release: ${JSON.stringify(conventionalChangelogRelease, null, 2)}`);
    }

    const repoUrl = this.getRepoUrl(conventionalChangelogRelease);

    const {commitGroups, currentTag, previousTag, version, date} = conventionalChangelogRelease;
    return {
      version: version,
      date: date,
      commitGroups: this.getProcessedCommitGroups(repoUrl, commitGroups),
      ...(this.pluginConfig.linkReferences && {compareUrl: this.getCompareUrl(repoUrl, currentTag, previousTag)})
    }
  }

  private getProcessedCommitGroups(repoUrl: string, commitGroups: ConventionalChangelogCommitGroup[]): ChangelogCommitGroup[] {
    return commitGroups.map(commitGroup => ({
      title: commitGroup.title,
      type: commitGroup.commits[0]?.raw.type,
      commits: this.getProcessedCommits(repoUrl, commitGroup.commits)
    }));
  }

  private getProcessedCommits(repoUrl: string, commits: ConventionalChangelogCommit[]): ChangelogCommit[] {
    return commits.map(commit => ({
      hash: commit.hash,
      subject: commit.subject,
      ...(commit.scope !== null && {scope: commit.scope}),
      ...(this.pluginConfig.linkReferences && {commitUrl: this.getCommitUrl(repoUrl, commit.hash)})
    }));
  }

  private getRepoUrl(conventionalChangelogRelease: ConventionalChangelogRelease): string {
    return `${conventionalChangelogRelease.host}/${conventionalChangelogRelease.owner}/${conventionalChangelogRelease.repository}`;
  }

  private getGitProvider(repoUrl: string): GitProviders {
    const {hostname} = new URL(repoUrl);
    switch(hostname) {
      case 'github.com':
        return GitProviders.GitHub;
      case 'gitlab.com':
        return GitProviders.GitLab;
      case 'bitbucket.org':
        return GitProviders.Bitbucket;
    }
  }

  private getCommitUrl(repoUrl: string, hash: string): string {
    const gitProvider = this.getGitProvider(repoUrl);

    switch(gitProvider) {
      case GitProviders.GitHub:
        return `${repoUrl}/commit/${hash}`;
      case GitProviders.GitLab:
        return `${repoUrl}/-/commit/${hash}`;
      case GitProviders.Bitbucket:
        return `${repoUrl}/commits/${hash}`;
    }
  }

  private getCompareUrl(repoUrl: string, currentTag: string, previousTag?: string): string {
    if (!previousTag) return;

    const gitProvider = this.getGitProvider(repoUrl);

    switch(gitProvider) {
      case GitProviders.GitHub:
        return `${repoUrl}/compare/${previousTag}...${currentTag}`;
      case GitProviders.GitLab:
        return `${repoUrl}/-/compare/${previousTag}...${currentTag}`;
      case GitProviders.Bitbucket:
        return `${repoUrl}/branches/compare/${previousTag}..${currentTag}#diff`;
    }
  }
}
