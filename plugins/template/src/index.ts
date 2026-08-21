import { metro, logger } from "@vendetta";
import Settings from "./Settings";

let unsubscribe: (() => void) | null = null;

export default {
    onLoad: () => {
        logger.log("Latest Used Servers loaded");

        try {
            const Dispatcher = metro.findByProps(
                "dispatch",
                "subscribe"
            );

            const UserStore = metro.findByProps(
                "getCurrentUser"
            );

            // Search loaded modules for likely guild-order functions.
            const candidates = metro.findAll((m: any) => {
                if (!m || typeof m !== "object") return false;

                return Object.keys(m).some((key) =>
                    /guild.*(move|position|order|reorder)|move.*guild/i.test(key)
                );
            });

            logger.log(
                `Latest Used Servers: found ${candidates.length} reorder candidates`
            );

            for (const module of candidates) {
                const names = Object.keys(module).filter((key) =>
                    /guild.*(move|position|order|reorder)|move.*guild/i.test(key)
                );

                if (names.length) {
                    logger.log(
                        `Latest Used Servers candidate: ${names.join(", ")}`
                    );
                }
            }

            if (!Dispatcher || !UserStore) {
                logger.error(
                    "Latest Used Servers: required modules not found"
                );
                return;
            }

            const handler = (event: any) => {
                const message = event?.message;

                if (!message?.guild_id) return;

                const currentUser =
                    UserStore.getCurrentUser?.();

                if (!currentUser) return;

                if (message.author?.id !== currentUser.id) return;

                logger.log(
                    `Latest Used Servers: sent message in ${message.guild_id}`
                );
            };

            Dispatcher.subscribe(
                "MESSAGE_CREATE",
                handler
            );

            unsubscribe = () => {
                try {
                    Dispatcher.unsubscribe(
                        "MESSAGE_CREATE",
                        handler
                    );
                } catch {}
            };
        } catch (e) {
            logger.error(
                `Latest Used Servers: ${String(e)}`
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
