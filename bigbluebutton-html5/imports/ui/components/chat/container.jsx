import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { createContainer } from 'meteor/react-meteor-data';

import Chat from './component';
import ChatService from './service';

const PUBLIC_CHAT_KEY = 'public';

const intlMessages = defineMessages({
  titlePublic: {
    id: 'app.chat.titlePublic',
    defaultMessage: 'Public Chat',
    description: 'Public chat title',
  },
  titlePrivate: {
    id: 'app.chat.titlePrivate',
    defaultMessage: 'Private Chat with {name}',
    description: 'Private chat title',
  },
  partnerDisconnected: {
    id: 'app.chat.partnerDisconnected',
    defaultMessage: '{name} has left the meeting',
    description: 'System chat message when the private chat partnet disconnect from the meeting',
  },
});

class ChatContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Chat {...this.props}>
        {this.props.children}
      </Chat>
    );
  }
}

export default injectIntl(createContainer(({ params, intl }) => {
  const chatID = params.chatID || PUBLIC_CHAT_KEY;

  let messages = [];
  let isChatLocked = ChatService.isChatLocked(chatID);

  if (chatID === PUBLIC_CHAT_KEY) {
    messages = ChatService.getPublicMessages();
    title = intl.formatMessage(intlMessages.titlePublic);
  } else {
    messages = ChatService.getPrivateMessages(chatID);
    let user = ChatService.getUser(chatID);

    if (user) {
      title = intl.formatMessage(intlMessages.titlePrivate, { name: user.name });
    } else {
      // let partnerName = messages.find(m => m.user && m.user.id === chatID).map(m => m.user.name);
      let partnerName = '{{NAME}}'; // placeholder until the server sends the name
      messages.push({
        content: [intl.formatMessage(intlMessages.partnerDisconnected, { name: partnerName })],
        time: Date.now(),
        sender: null,
      });
      isChatLocked = true;
    }
  }

  return {
    title,
    messages,
    isChatLocked,
    actions: {
      handleSendMessage: message => ChatService.sendMessage(chatID, message),
    },
  };
}, ChatContainer));
