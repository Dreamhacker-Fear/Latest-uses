import { metro, logger } from "@vendetta";
import Settings from "./Settings";

let unsubscribe: (() => void) | null = null;

function moveGuildToTop(guildId: string) {
    try {
        const GuildActions = metro.findByProps(
            "moveGuild",
            "moveGuildToPosition"
        );

        if (GuildActions?.moveGuildToPosition) {
            GuildActions.moveGuildToPosition(guildId, 0);
            logger.log(`Latest Used Servers: moved ${guildId} to top`);
            return;
        }

        if (GuildActions?.moveGuild) {
            GuildActions.moveGuild(guildId, 0);
            logger.log(`Latest Used Servers: moved ${guildId} to top`);
            return;
        }

        logger.error(
            "Latest Used Servers: native guild reorder function not found"
        );
    } catch (e) {
        logger.error(
            `Latest Used Servers: ${String(e)}`
        );
    }
}

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

                // Only messages YOU send.
                if (message.author?.id !== currentUser.id) {
                    return;
                }

                moveGuildToTop(message.guild_id);
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

            logger.log(
                "Latest Used Servers: message tracking enabled"
            );
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

        logger.log(
            "Latest Used Servers unloaded"
        );
    },

    settings: Settings,
};
