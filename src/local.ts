import { JsonChangelogGenerator } from './json-changelog-generator';

class Logger {
  log(msg: string) {
    console.log(msg);
  }
}

export async function generateNotes(): Promise<void> {
  const logger = new Logger();
  const nextRelease = {
    version: '1.2.3'
  }
  const pluginConfig = {
    // linkReferences: false
  }

  const jsonChangelogGenerator = new JsonChangelogGenerator(pluginConfig, nextRelease as any, logger as any);
  await jsonChangelogGenerator.generateChangelog();
}

generateNotes();
