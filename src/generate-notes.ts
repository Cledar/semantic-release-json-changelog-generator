import { JsonChangelogGenerator } from './json-changelog-generator';
import { PluginConfig } from './models/plugin-config';
import type { Context } from 'semantic-release'; 

export async function generateNotes(pluginConfig: PluginConfig, context: Context): Promise<void> {
  const { nextRelease, logger } = context;

  const jsonChangelogGenerator = new JsonChangelogGenerator(pluginConfig, nextRelease, logger);
  await jsonChangelogGenerator.generateChangelog();
}
