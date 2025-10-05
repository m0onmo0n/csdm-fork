// src/cli/commands/highlights-command.ts

import fs from 'fs-extra';
import { Command } from './command';
import { watchPlayerHighlights } from 'csdm/node/counter-strike/launcher/watch-player-highlights';

export class HighlightsCommand extends Command {
  public static Name = 'highlights';
  private demoPath: string | undefined = undefined;
  private steamId: string | undefined = undefined;

  public getDescription() {
    return 'Launch CS and watch the highlights of a specific player from a demo file.';
  }

  public printHelp() {
    console.log(this.getDescription());
    console.log('');
    console.log(`Usage: csdm ${HighlightsCommand.Name} <demoPath> <steamId64>`);
    console.log('');
    console.log('Arguments:');
    console.log('  demoPath:  Path to the .dem file (can be relative or absolute).');
    console.log('  steamId64: The 64-bit Steam ID of the player.');
    console.log('');
    console.log('Example:');
    console.log(`  csdm ${HighlightsCommand.Name} "C:\\demos\\mymatch.dem" "76561198000000000"`);
  }

  public async run() {
    this.parseArgs();

    if (!this.demoPath || !this.steamId) {
      console.error('Demo path and Steam ID are required.');
      this.printHelp();
      this.exitWithFailure();
      return;
    }

    const demoPathExists = await fs.pathExists(this.demoPath);
    if (!demoPathExists) {
      console.error(`Demo file not found at: ${this.demoPath}`);
      this.exitWithFailure();
      return;
    }

    try {
      await this.initDatabaseConnection();
      console.log(`Generating highlights for player ${this.steamId} from demo ${this.demoPath}...`);

      await watchPlayerHighlights({
        demoPath: this.demoPath,
        steamId: this.steamId,
        perspective: 'player',
        onGameStart: () => {
          // This callback is required, but we don't need it to do anything for the CLI.
        },
      });

      console.log('Highlights command sent to the game.');
    } catch (error) {
      console.error('An error occurred while trying to watch player highlights:');
      console.error(error);
      this.exitWithFailure();
    }
  }

  protected parseArgs() {
    // Basic argument parsing: first argument is demo path, second is Steam ID.
    const nonFlagArgs = this.args.filter((arg) => !this.isFlagArgument(arg));
    if (nonFlagArgs.length >= 2) {
      this.demoPath = nonFlagArgs[0];
      this.steamId = nonFlagArgs[1];
    }
  }
}
