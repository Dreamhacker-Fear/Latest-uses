import { metro, patcher, logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

let unpatch: (() => void) | null = null;

function rememberServer(id: string) {
    if (!id) return;

    const recent = storage.recentServers ?? [];

    storage.recentServers = [
        id,
        ...recent.filter((x: string) => x !== id),
    ].slice(0, 100);
}

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            const NavigationStore = metro.findByProps(
                "getLastSelectedGuildId"
            );

            if (!NavigationStore) {
                logger.error("Latest Used Servers: navigation store not found");
                return;
            }

            unpatch = patcher.after(
                NavigationStore,
                "getLastSelectedGuildId",
                (_args, result) => {
                    if (result) {
                        rememberServer(result);
                    }

                    return result;
                }
            );

            logger.log("Latest Used Servers: tracking enabled");
        } catch (e) {
            logger.error(`Latest Used Servers: ${String(e)}`);
        }
    },

    onUnload: () => {
        if (unpatch) {
            unpatch();
            unpatch = null;
        }

        logger.log("Latest Used Servers unloaded");
    },

    settings: Settings,
};
