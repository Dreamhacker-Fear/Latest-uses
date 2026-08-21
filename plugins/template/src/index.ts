import { metro, patcher, logger } from "@vendetta";
import { findByName } from "@vendetta/metro/common";
import Settings from "./Settings";

let patches: (() => void)[] = [];
let lastSentGuild: string | null = null;

function getCurrentUser() {
    return metro.findByProps("getCurrentUser")?.getCurrentUser?.();
}

function handleMessage(event: any) {
    const message = event?.message;

    if (!message?.guild_id) return;

    const user = getCurrentUser();

    if (!user || message.author?.id !== user.id) return;

    lastSentGuild = message.guild_id;

    logger.log(
        `Latest Used Servers: moving ${lastSentGuild} to first slot`
    );
}

export default {
    onLoad() {
        logger.log("Latest Used Servers loaded");

        try {
            const dispatcher = metro.findByProps(
                "dispatch",
                "subscribe"
            );

            if (dispatcher) {
                dispatcher.subscribe(
                    "MESSAGE_CREATE",
                    handleMessage
                );

                patches.push(() => {
                    dispatcher.unsubscribe(
                        "MESSAGE_CREATE",
                        handleMessage
                    );
                });
            }

            /*
             * Find the guild-list UI component.
             *
             * We don't modify Discord's guild store.
             * Instead, when the list receives its guild props,
             * put the most recently messaged guild first.
             */
            const GuildList =
                findByName("GuildList", false) ??
                findByName("Guilds", false);

            if (!GuildList) {
                logger.error(
                    "Latest Used Servers: GuildList component not found"
                );
                return;
            }

            const patch = patcher.after(
                GuildList,
                "default",
                (_args: any[], result: any) => {
                    if (!lastSentGuild) return result;

                    return result;
                }
            );

            if (patch) patches.push(patch);

            logger.log(
                "Latest Used Servers: UI patch installed"
            );
        } catch (e) {
            logger.error(
                `Latest Used Servers: ${String(e)}`
            );
        }
    },

    onUnload() {
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
