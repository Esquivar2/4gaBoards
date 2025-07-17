const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.label)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    labelAlreadyInCard: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    const cardLabel = await CardLabel.create({
      ...values,
      cardId: values.card.id,
      labelId: values.label.id,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', 'labelAlreadyInCard')
      .fetch();

    if (cardLabel) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'cardLabelCreate',
        {
          item: cardLabel,
        },
        inputs.request,
      );

      await sails.helpers.actions.createOne.with({
        values: {
          card: values.card,
          type: Action.Types.CARD_LABEL_ADD,
          data: {
            id: cardLabel.id,
            labelId: cardLabel.labelId,
            name: values.label.name,
          },
          user: currentUser,
        },
        currentUser,
      });

      await sails.helpers.cards.updateMeta.with({ id: cardLabel.cardId, currentUser, skipMetaUpdate });
    }

    return cardLabel;
  },
};
