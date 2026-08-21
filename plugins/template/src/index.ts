import { metro, patcher, logger } from "@vendetta";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

let unpatch: (() => void) | null = null;

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            const NavigationStore = metro.findByProps(
                "getLastSelectedGuildId"
            );

            if (!NavigationStore) {
                logger.error("Latest Used Servers: navigation module not found");
                return;
            }

            const original = NavigationStore.getLastSelectedGuildId;

            unpatch = patcher.after(
                NavigationStore,
                "getLastSelectedGuildId",
                (_args, result) => {
                    if (!result) return result;

                    const recent = storage.recentServers ?? [];

                    storage.recentServers = [
                        result,
                        ...recent.filter((id: string) => id !== result),
                    ].slice(0, 100);

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
