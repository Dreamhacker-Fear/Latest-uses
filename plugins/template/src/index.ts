import { metro, patcher, logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

let patches: (() => void)[] = [];

const getRecent = (): string[] => storage.recentServers ?? [];

function rememberServer(id: string) {
    if (!id) return;

    storage.recentServers = [
        id,
        ...getRecent().filter((x) => x !== id),
    ].slice(0, 100);
}

function sortGuilds(guilds: any[]) {
    const recent = getRecent();

    return [...guilds].sort((a, b) => {
        const ai = recent.indexOf(a?.id);
        const bi = recent.indexOf(b?.id);

        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;

        return ai - bi;
    });
}

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            // Track the server you currently select.
            const navigation = metro.findByProps(
                "getLastSelectedGuildId"
            );

            if (navigation) {
                patches.push(
                    patcher.after(
                        navigation,
                        "getLastSelectedGuildId",
                        (_args, result) => {
                            if (result) rememberServer(result);
                            return result;
                        }
                    )
                );
            }

            // Reorder the guild data according to recent usage.
            const guildStore = metro.findByProps("getGuilds");

            if (guildStore) {
                patches.push(
                    patcher.after(
                        guildStore,
                        "getGuilds",
                        (_args, result) => {
                            if (!result || typeof result !== "object") {
                                return result;
                            }

                            const sorted = sortGuilds(
                                Object.values(result)
                            );

                            const reordered: Record<string, any> = {};

                            for (const guild of sorted) {
                                if (guild?.id) {
                                    reordered[guild.id] = guild;
                                }
                            }

                            return reordered;
                        }
                    )
                );
            }

            logger.log("Latest Used Servers: tracking enabled");
        } catch (error) {
            logger.error(
                `Latest Used Servers: ${String(error)}`
            );
        }
    },

    onUnload: () => {
        for (const unpatch of patches) {
            try {
                unpatch();
            } catch {}
        }

        patches = [];

        logger.log("Latest Used Servers unloaded");
    },

    settings: Settings,
};
