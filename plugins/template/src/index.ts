import { metro, patcher, logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

let patches: (() => void)[] = [];

function rememberServer(id: string) {
    if (!id) return;

    const recent = storage.recentServers ?? [];

    storage.recentServers = [
        id,
        ...recent.filter((x: string) => x !== id),
    ].slice(0, 100);
}

function reorderGuilds(guilds: any[]) {
    const recent: string[] = storage.recentServers ?? [];

    return [...guilds].sort((a, b) => {
        const aId = a?.id;
        const bId = b?.id;

        const aIndex = recent.indexOf(aId);
        const bIndex = recent.indexOf(bId);

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
    });
}

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            const NavigationStore = metro.findByProps(
                "getLastSelectedGuildId"
            );

            if (NavigationStore) {
                patches.push(
                    patcher.after(
                        NavigationStore,
                        "getLastSelectedGuildId",
                        (_args, result) => {
                            if (result) {
                                rememberServer(result);
                            }

                            return result;
                        }
                    )
                );
            }

            const GuildStore = metro.findByProps("getGuilds");

            if (!GuildStore) {
                logger.error("Latest Used Servers: GuildStore not found");
                return;
            }

            const originalGetGuilds = GuildStore.getGuilds;

            if (typeof originalGetGuilds === "function") {
                patches.push(
                    patcher.after(
                        GuildStore,
                        "getGuilds",
                        (_args, result) => {
                            if (!result || typeof result !== "object") {
                                return result;
                            }

                            const guilds = Object.values(result);

                            const sorted = reorderGuilds(guilds);

                            const output: Record<string, any> = {};

                            for (const guild of sorted) {
                                if (guild?.id) {
                                    output[guild.id] = guild;
                                }
                            }

                            return output;
                        }
                    )
                );
            }

            logger.log("Latest Used Servers: tracking + reordering enabled");
        } catch (e) {
            logger.error(`Latest Used Servers: ${String(e)}`);
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
