$(document).ready(() => {
    $("html").attr("lang", localeFile.cCode);

    const guilds = $("#guilds");
    const channels = $("#channels");
    const channelNameLabel = $("#channelNameLabel");
    const channelName = $("#channelName");
    const chat = $("#chat");
    const toSend = $("#toSend");
    const lastMessages = $("#lastMessages");
    const clearChat = $("#clearChat");
    const send = $("#send");
    const guildName = $("#guildName");
    const leaveGuild = $("#leaveGuild");
    const inviteBtn = $("#inviteBtn");
    const refreshToken = $("#refreshToken");
    const refreshChat = $("#refreshChat");
    const overlay = $("#overlay-content");

    /*///////////////////////////////////////////
                    LOADING TRANSLATION
    //////////////////////////////////////////*/

    Object.values(locales).forEach((locale) => {
        overlay.html(overlay.html() + `<a href="" onclick="localStorage.setItem('locale', '${locale.cCode}'); location.reload()">${locale.language}</a>`);
    });

    // Text
    channelNameLabel.html(localeFile.text.channelNameLabel);
    $("#animCheck").html(localeFile.text.scrollCheck);
    channelName.html(`<img class="avatarIMG" src='./img/icon/chat.png' alt="chat"> ${localeFile.text.channelNameLabel}`);

    // Headings
    guildName.html(`<img class="avatarIMG" src="./img/icon/info.png" alt="info"> ${localeFile.headings.guildName}`);
    $("#autoScrollHead").html(localeFile.headings.autoScroll);
    $("#lastMessagesHead").html(`<img class="avatarIMG" src='./img/icon/clock.png' alt="clock"> ${localeFile.headings.lastMessages}`);
    $("#last").html(localeFile.headings.lastMessages);

    // Buttons
    refreshToken.html(`🔑 ${localeFile.buttons.editToken}`);
    refreshChat.html(`🔁 ${localeFile.buttons.refreshChat}`);
    $("#language").html(`🏳️ ${localeFile.buttons.changeLanguage}`);
    leaveGuild.html(`🚪 ${localeFile.buttons.leave}`);
    inviteBtn.html(`✉ ${localeFile.buttons.invite}`);
    send.html(`↩ ${localeFile.buttons.send}`);
    clearChat.html(`♻ ${localeFile.buttons.clearLastMessages}`);

    // Formatting
    $("#bold").attr("title", localeFile.formatting.bold);
    $("#emphasis").attr("title", localeFile.formatting.emphasis);
    $("#underline").attr("title", localeFile.formatting.underline);
    $("#strike").attr("title", localeFile.formatting.strike);
    $("#clear").attr("title", localeFile.formatting.clear);

    /*///////////////////////////////////////////
                    FUNCTIONS
    //////////////////////////////////////////*/

    // This function creates a message to display in the chat, takes a Discord.Message as parameter
    function createMessage(message) {
        let userTag = escapeHtml(message.author.tag);
        let userId = message.author.id;
        let avatarUrl = message.author.avatarURL() || `./img/discord_defaults_avatars/${message.author.discriminator % 5}.png`; // Get the user's avatar, if not, find the color of his default avatar
        let userAvatar = `<a href="${avatarUrl}" target="_blank"><img alt="" src="${avatarUrl}" class="avatarIMG"></a>`;
        let timestamp = formatTimestamp(message.createdAt);
        let html;
        let attachments = [];
        let embeds = [];
        let links = [];

        Array.from(message.attachments).forEach((attachment) => {
            let attachmentUrl = attachment[1].url;
            let attachmentTxt = `<a href="${escapeHtml(attachmentUrl)}" target="_blank">`;
            if (attachmentUrl.endsWith(".jpg") || attachmentUrl.endsWith(".jpeg") || attachmentUrl.endsWith(".png")) {
                return embeds.push(`<a href="${attachmentUrl}" target="_blank"><img class="chatImg" src="${attachmentUrl}" alt=""></a>`);
            } else if (attachmentUrl.endsWith(".mp4")) {
                return embeds.push(`<figure><figcaption>${attachment[1].name}</figcaption><video controls src="${attachmentUrl}"></video></figure>`);
            } else if (attachmentUrl.endsWith(".mp3")) {
                return embeds.push(`<figure><figcaption>${attachment[1].name}</figcaption><audio controls src="${attachmentUrl}"></audio></figure>`);
            } else if (attachmentUrl.endsWith(".docx") || attachmentUrl.endsWith(".odt")) {
                attachmentTxt += localeFile.fileType.doc;
            } else if (attachmentUrl.endsWith(".pdf")) {
                attachmentTxt += localeFile.fileType.pdf;
            } else {
                attachmentTxt += localeFile.fileType.unknown;
            }
            attachmentTxt += "</a>";
            attachments.push(attachmentTxt);
        });

        if (message.embeds.length) message.embeds.forEach((embed) => {
            let html = "";
            let fields = [];

            if (embed.url) links.push(embed.url);
            if (embed.author) {
                if (embed.author.iconURL) html += `<a href="${embed.author.iconURL}" target="_blank"><img class="avatarIMG" src="${embed.author.iconURL}"> </a>`;
                if (embed.author.url) {
                    html += `<a href="${embed.author.url}">${embed.author.name}</a>`;
                } else {
                    html += embed.author.name;
                }
            }

            if (embed.title) {
                if (embed.author) html += "<br><br>";
                html += `<b>${embed.title}</b>`;
            }

            if (embed.description) {
                if (embed.author || embed.title) html += "<br><br>";
                html += contentReplacement(embed.description);
            }

            if (embed.fields.length > 0) {
                if (embed.author || embed.title || embed.description) html += "<br><br>";
                embed.fields.forEach((field) => {
                    fields.push(`<p><b>${field.name}</b><br>${contentReplacement(field.value)}<p>${field.inline ? "" : "<br>"}`)
                });
            }
            html += fields.join('');

            if (embed.video !== null) {
                if (embed.author || embed.title || embed.description || fields.length > 0) html += "<br><br>";
                html += `<video controls src="${embed.video.url}"></video>`;
            } else if (embed.image !== null) {
                if (embed.author || embed.title || embed.description || fields.length > 0) html += "<br><br>";
                html += `<a href="${embed.image.url}" target="_blank"><img class="chatImg" src="${embed.image.url}" alt=""></a>`;
            } else if (embed.thumbnail !== null) {
                if (embed.author || embed.title || embed.description || fields.length > 0) html += "<br><br>";
                html += `<a href="${embed.thumbnail.url}" target="_blank"><img class="chatImg" src="${embed.thumbnail.url}" alt=""></a>`;
            }

            embeds.push(html)
        });

        html = `<div class="chatMsg" id="${message.id}">${userAvatar} ${escapeHtml(userTag)} `;

        // Different types of messages
        if (message.type === "GUILD_MEMBER_JOIN") {
            html += `${localeFile.messageType.serverJoin} `;
        } else if (message.type === "PINS_ADD") {
            html += `${localeFile.messageType.pin} `;
        } else if (message.type === "CHANNEL_FOLLOW_ADD") {
            html += `${localeFile.messageType.channelNews} `;
        } else if (message.type.includes("USER_PREMIUM_GUILD_SUBSCRIPTION")) {
            html += `${localeFile.messageType.boost} `; // Covers all levels of boosting
        } else if (message.content === "" && attachments.length > 0) {
            html += `${localeFile.text.fileSent} `;
        }

        // Timestamp & mention button
        html += `<span class="font-size-mini">${timestamp}</span> <button class="mini" data-value="<@!${userId}>" onclick="addText(this.dataset.value)">😐</button>`;

        // Delete button
        if (message.deletable && ((guilds.val() === "DM" && message.author.id === client.user.id) || message.guild.me.hasPermission("MANAGE_MESSAGES"))) {
            html += `<button class="mini" data-value="${message.id}" onclick="del(this.dataset.value)">🗑️</button>`;
        }

        if (message.content !== "") {
            html += `<br><span class="messageContent">${contentReplacement(message.content, links)}</span>`;
        } else {
            html += `<span class="messageContent"></span>`;
        }

        if (embeds.length) {
            html += `<br><span class="embeds">${embeds.join('')}</span>`;
        }

        if (attachments.length) {
            html += `<br><span class="messageContent">${localeFile.text.attachmentTxt} : ${attachments.join(', ')}</span>`;
        }

        return `${html}</div>`;
    }

    function updateChannel() {
        let channel;
        let user;

        chat.empty();
        if (guilds.val() === "DM") {
            user = client.users.cache.find((user) => user.id === channels.val());

            channel = user.dmChannel;
            let avatarUrl = user.avatarURL() || `./img/discord_defaults_avatars/${user.discriminator % 5}.png`;
            guildName.html(`<a href="${avatarUrl}" target="_blank"><img alt="" src="${avatarUrl}" class="avatarIMG"/></a> ${escapeHtml(user.username)}`);
            $("#guildInfo").html(`${localeFile.text.userId} : (${user.id}) <button class="mini" data-value="<@!${user.id}>" onclick="addText(this.dataset.value)">@</button>`);

            channelNameLabel.text(`${localeFile.text.channelNameLabel} [${user.username}]`);
            channelName.html(`<img alt="" src="./img/icon/chat.png" class="avatarIMG"/> #${escapeHtml(user.username)}`);

            if (channel !== null) {
                channel.messages.fetch().then((messages) => {
                    Array.from(messages).reverse().forEach((msg) => {
                        chat.html(chat.html() + createMessage(msg[1]));
                    });
                });
            }
        } else {
            channel = client.channels.cache.find((c) => c.id === channels.val());

            if (channel === null) {
                return;
            }

            channelNameLabel.text(`${localeFile.text.channelNameLabel} [${channel.name}]`);
            channelName.html(`<img alt="" src="./img/icon/chat.png" class="avatarIMG"/> #${escapeHtml(channel.name)}`);
            channel.messages.fetch().then((messages) => {
                Array.from(messages).reverse().forEach((msg) => {
                    chat.html(chat.html() + createMessage(msg[1]));
                });
            });
            $("#chk2")[0].checked = true;
        }
    }

    function updateGuild() {
        let usersArray = [];
        let guildEmojis = [];
        let guildMembers = [];
        let guild;
        let html = "";

        channels.children("option").remove();
        if (guilds.val() === "DM") {
            // includes client self user and clyde
            if (client.users.cache.size <= 2) {
                return;
            }

            client.users.cache.forEach((user) => {
                if (!user.bot) {
                    usersArray.push([escapeHtml(user.username.toLowerCase()), user.id, escapeHtml(user.tag)]);
                }
            });

            usersArray.sort();

            for (let i = 0; i < usersArray.length; i++) {
                channels.append(`<option value="${usersArray[i][1]}">${escapeHtml(usersArray[i][2])}</option>`);
            }
        } else {
            guild = client.guilds.cache.find((g) => g.id === guilds.val());

            if (guild.channels.cache.filter((chan) => chan.type === "text").size > 0) {
                guild.channels.cache.filter((chan) => chan.type === "text").forEach((channel) => {
                    if (channel.permissionsFor(guild.me).has("VIEW_CHANNEL")) {
                        channels.append(`<option value="${channel.id}">#${escapeHtml(channel.name)}</option>`);
                    }
                });
            }

            guildName.html(`<a href="${guild.iconURL() || "./img/icon/info.png"}" target="_blank"><img alt="" src="${guild.iconURL() || "./img/icon/info.png"}" class="avatarIMG"/></a> ${escapeHtml(guild.name)}`);

            // General information
            html += `${localeFile.infos.owner}: ${guild.owner.user.tag} <button data-value="<@!${guild.owner.user.id}>" class="mini" onclick="addText(this.dataset.value)">@</button><br>`;
            html += `${localeFile.infos.members}: ${guild.members.cache.filter((member) => !member.user.bot).size}<br>`;
            html += `${localeFile.infos.vChannels}: ${guild.channels.cache.filter((chan) => chan.type === "voice").size}<br>`;
            html += `${localeFile.infos.tChannels}: ${guild.channels.cache.filter((chan) => chan.type === "text").size}<br><br>`;

            // Members button
            guild.members.cache.filter((member) => !member.user.bot).forEach((member) => {
                let avatarUrl = member.user.avatarURL() || `./img/discord_defaults_avatars/${member.user.discriminator % 5}.png`;
                guildMembers.push(`<a href="${avatarUrl}" target="_blank"><img alt="" style="display: inline;" class="avatarIMG" src="${avatarUrl}"/></a> ${member.user.tag} <button data-value="<@!${member.user.id}>" onclick="addText(this.dataset.value)" class="mini">@</button>`);
            });
            html += `<button onclick='toggleVisibilityHeight("#guildMembers")'>${localeFile.infos.members}</button>`;
            html += `<div id="guildMembers" style="display:none; opacity: 0;">${guildMembers.join("<br>")}</div>`;

            // Roles button
            html += `<button onclick='toggleVisibilityHeight("#guildRoles")'>${localeFile.infos.roles}</button>`;
            html += `<div id="guildRoles" style="display:none; opacity: 0;">${guild.roles.cache.map((role) => `${escapeHtml(role.name)} (${role.id})`).join("<br>")}</div>`;

            // Channels button
            if (guild.channels.cache.size > 0) {
                html += `<button onclick='toggleVisibilityHeight("#guildChannels")'>${localeFile.infos.channels}</button>`;
                html += `<div id="guildChannels" style="display:none; opacity: 0;">${guild.channels.cache.map((channels) => `${escapeHtml(channels.name)} (${channels.id})`).join("<br>")}</div>`;
            }

            // Emoji button
            if (guild.emojis.cache.size > 0) {
                guild.emojis.cache.forEach((emoji) => {
                    if (emoji.animated) {
                        guildEmojis.push(`<img alt="" class="emojiImg" src="${emoji.url}" onclick="addText('<${emoji.identifier}>')"/>`);
                    } else {
                        guildEmojis.push(`<img alt="" class="emojiImg" src="${emoji.url}" onclick="addText('<:${emoji.identifier}>')"/>`);
                    }
                });
                html += `<button onclick='toggleVisibilityWidth("#guildEmojis")'>${localeFile.infos.emojis}</button>`;
                html += `<div id="guildEmojis" style="display:none; opacity: 0;">${guildEmojis.join(" ")}</div>`;
            }

            $("#guildInfo").html(html);
        }

        updateChannel();
    }

    function fetchGuilds() {
        channels.children("option").remove();
        guilds.children("option").remove();

        if (client.guilds.cache.size === 0) {
            return;
        }

        client.guilds.cache.forEach((guild) => {
            guilds.append(`<option value="${guild.id}">${escapeHtml(guild.name)}</option>`);
        });
        guilds.append(`<option value="DM">[${localeFile.text.privateMessages}]</option>`);

        updateGuild();
    }

    function sendMessage() {
        let user;

        if (toSend.html() === "") {
            tempChange("#send", `[${localeFile.errors.emptyMsg}]`, 1500);
        } else {
            let formatted = toSend.html()
                .replace(/<b>/g, "**")
                .replace(/<\/b>/g, "**")
                .replace(/<em>/g, "*")
                .replace(/<\/em>/g, "*")
                .replace(/<i>/g, "*")
                .replace(/<\/i>/g, "*")
                .replace(/<u>/g, "__")
                .replace(/<\/u>/g, "__")
                .replace(/<strike>/g, "~~")
                .replace(/<\/strike>/g, "~~")
                .replace(/<s>/g, "~~")
                .replace(/<\/s>/g, "~~")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/<br>/g, "\n");

            if (guilds.val() === "DM") {
                user = client.users.cache.find((user) => user.id === channels.val());
                user.send(formatted);
            } else {
                client.channels.cache.find((channel) => channel.id === channels.val()).send(formatted).catch(() => {
                    tempChange("#send", `[${localeFile.errors.missingPermissions}]`, 2000);
                });
            }
            toSend.html("");
        }
    }

    function selectChannelOnReload(channel) {
        $(`#channels option[value="${channel}"]`).prop('selected', true);
        setTimeout(() => {
            refreshChat.click();
        }, 1000);
    }

    function scrollAnim(DOM1, DOM2, time) {
        if (document.querySelector(DOM1).checked) {
            if (document.querySelector("#chk3").checked) {
                $(DOM2).animate({
                    scrollTop: $(DOM2)[0].scrollHeight - $(DOM2).height()
                }, time);
            } else {
                $(DOM2).scrollTop($(DOM2)[0].scrollHeight - $(DOM2).height());
            }
        }
    }

    /*///////////////////////////////////////////
                    DISCORD EVENTS
    //////////////////////////////////////////*/
    client.on("message", (message) => {
        if (Number(message.channel.id) === Number(channels.val())) {
            chat.html(chat.html() + createMessage(message));
        }

        if ((Number(message.author.id) === Number(channels.val()) || message.author.id === client.user.id) && message.channel.type === "dm") {
            updateChannel();
        }

        if (message.channel.id === channels.val() || (guilds.val() === "DM" && message.channel.type === "dm" && message.author.id === channels.val())) {
            return;
        }

        if (message.channel.type !== "dm" && (Number(message.author.id) === Number(client.user.id) || !message.author.bot)) {
            lastMessages.html(lastMessages.html() + `<br>[<b>#${escapeHtml(message.channel.name)} | ${escapeHtml(message.author.tag)}]</b> ${contentReplacement(message.content)}`);
        } else if (message.channel.type === "dm" && !message.author.bot) {
            lastMessages.html(lastMessages.html() + `<br><b>[${localeFile.text.privateMessages}] ${escapeHtml(message.author.tag)}</b> ${contentReplacement(message.content)}`);
        }

        localStorage.setItem("lastMessages", $("#lastMessages").html());
    });

    client.on("ready", () => {
        lastMessages.html(localStorage.getItem("lastMessages") || "");
        fetchGuilds();
    });

    client.on("messageDelete", (message) => {
        if (Number(message.channel.id) === Number(channels.val())) {
            $(`#${message.id}`).remove();
        }

        if ((Number(message.author.id) === Number(channels.val()) || message.author.id === client.user.id) && message.channel.type === "dm") {
            updateChannel();
        }
    });

    client.on("messageUpdate", (oldMessage, newMessage) => {
        if (Number(oldMessage.channel.id) === Number(channels.val())) {
            $(`#${oldMessage.id}`).replaceWith(createMessage(newMessage));
            $(`#${oldMessage.id} > span.font-size-mini`).html(`Edited at : ${formatTimestamp(newMessage.editedAt)}`);
        }

        if ((Number(oldMessage.author.id) === Number(channels.val()) || oldMessage.author.id === client.user.id) && oldMessage.channel.type === "dm") {
            updateChannel();
        }
    });

    client.on("guildCreate", () => {
        fetchGuilds();
    });

    client.on("guildDelete", () => {
        fetchGuilds();
    });

    client.on("guildUpdate", (oldGuild,) => {
        if (oldGuild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    client.on("guildMemberAdd", (member) => {
        if (member.guild.id === guilds.val()) {
            updateGuild();
            selectChannelOnReload()
        }
    });

    client.on("guildMemberRemove", (member) => {
        if (member.guild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    client.on("channelCreate", (channel) => {
        if (guilds.val() === "[DM]" || channel.type === "dm") {
            return;
        }

        if (channel.guild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    client.on("channelDelete", (channel) => {
        if (channel.guild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    client.on("channelUpdate", (oldChannel) => {
        if (oldChannel.guild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    client.on("emojiCreate", (emoji) => {
        if (emoji.guild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    client.on("emojiDelete", (emoji) => {
        if (emoji.guild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    client.on("emojiUpdate", (oldEmoji) => {
        if (oldEmoji.guild.id === guilds.val()) {
            let channel = channels.val();
            updateGuild();
            selectChannelOnReload(channel)
        }
    });

    /*///////////////////////////////////////////
                    DOCUMENT EVENTS
    //////////////////////////////////////////*/

    $(document).on("change", "#guilds", () => {
        updateGuild();
    });

    $(document).on("change", "#channels", () => {
        updateChannel();
    });

    /*///////////////////////////////////////////
                    BUTTONS EVENTS
    //////////////////////////////////////////*/

    refreshToken.click(() => {
        if (window.confirm(localeFile.token.confirmation)) {
            localStorage.setItem("token", "");
            window.location.reload();
        }
    });

    send.click(() => {
        sendMessage();
    });

    clearChat.click(() => {
        localStorage.setItem("lastMessages", "");
        $("#lastMessages").empty();
    });

    leaveGuild.click(() => {
        if (guilds.val() !== "DM") {
            if (window.confirm(localeFile.token.confirmation)) {
                client.guilds.cache.find((guild) => guild.id === guilds.val()).leave().catch(() => {
                    tempChange("#leaveGuild", `[${localeFile.errors.error}]`, 2000);
                });
            }
        }
    });

    inviteBtn.click(() => {
        if (guilds.val() !== "DM") {
            client.channels.cache.find((channel) => channel.id === channels.val()).createInvite().then((invite) => {
                alert(`discord.gg/${invite.code}`);
            }).catch(() => {
                tempChange("#inviteBtn", `[${localeFile.errors.missingPermissions}]`, 2000);
            });
        } else {
            tempChange("#inviteBtn", `[${localeFile.errors.dm}]`, 2000);
        }

    });

    refreshChat.click(() => {
        updateChannel();
    });

    /*///////////////////////////////////////////
                    KEY/PASTE EVENTS
    //////////////////////////////////////////*/

    toSend.keypress((event) => {
        if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            send.click();
        }
        event.stopPropagation();
    });

    toSend.on("paste", (event) => {
        event.preventDefault();
        let text = (event.originalEvent || event).clipboardData.getData('text/plain');
        document.execCommand("insertHTML", false, text);
    });

    document.addEventListener("keyup", (event) => {
        if (event.code === "Escape") {
            event.preventDefault();
            closeNav();
        }
        event.stopPropagation();
    });

    /*///////////////////////////////////////////
                    AUTO-SCROLL
    //////////////////////////////////////////*/

    lastMessages.bind("mousewheel", (event) => {
        if (event.originalEvent.deltaY < 0) {
            $("#chk1")[0].checked = false;
        } else if (event.originalEvent.deltaY > 0 && $("#lastMessages").scrollTop() + $("#lastMessages").innerHeight() >= $("#lastMessages")[0].scrollHeight - 80) {
            $("#chk1")[0].checked = true;
        }
    });

    chat.bind("mousewheel", (event) => {
        if (event.originalEvent.deltaY < 0) {
            $("#chk2")[0].checked = false;
        } else if (event.originalEvent.deltaY > 0 && $("#chat").scrollTop() + $("#chat").innerHeight() >= $("#chat")[0].scrollHeight - 80) {
            $("#chk2")[0].checked = true;
        }
    });

    setInterval(() => {
        scrollAnim("#chk1", "#lastMessages", 1000);
        scrollAnim("#chk2", "#chat", 250);
    }, 500);
});