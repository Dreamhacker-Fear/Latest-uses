import { metro, logger } from "@vendetta";
import Settings from "./Settings";

let unsubscribe: (() => void) | null = null;

export default {
    onLoad: () => {
        logger.log("Latest Used Servers scanner loaded");

        try {
            const Dispatcher = metro.findByProps(
                "dispatch",
                "subscribe"
            );

            if (!Dispatcher) {
                logger.error("Latest Used Servers: dispatcher not found");
                return;
            }

            const handler = (event: any) => {
                try {
                    if (!event || !event.type) return;

                    const interesting =
                        /guild|server|position|folder|move|order/i.test(
                            String(event.type)
                        );

                    if (!interesting) return;

                    storage.lastGuildAction = String(event.type);

                    try {
                        storage.lastGuildPayload = JSON.stringify(
                            event,
                            null,
                            2
                        ).slice(0, 4000);
                    } catch {
                        storage.lastGuildPayload = String(event);
                    }

                    logger.log(
                        `Latest Used Servers detected: ${event.type}`
                    );
                } catch {}
            };

            // Listen to likely guild-reordering related dispatcher events.
            const events = [
                "GUILD_UPDATE",
                "GUILD_ORDER_UPDATE",
                "GUILD_POSITIONS_UPDATE",
                "GUILD_FOLDER_UPDATE",
                "USER_SETTINGS_UPDATE",
            ];

            for (const event of events) {
                try {
                    Dispatcher.subscribe(event, handler);
                } catch {}
            }

            unsubscribe = () => {
                for (const event of events) {
                    try {
                        Dispatcher.unsubscribe(event, handler);
                    } catch {}
                }
            };

            logger.log("Latest Used Servers scanner active");
        } catch (e) {
            logger.error(
                `Latest Used Servers scanner: ${String(e)}`
            );
        }
    },

    onUnload: () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
    },

    settings: Settings,
};
