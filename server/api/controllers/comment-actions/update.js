const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  COMMENT_ACTION_NOT_FOUND: {
    commentActionNotFound: 'Comment action not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    text: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    commentActionNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const path = await sails.helpers.actions
      .getProjectPath({
        id: inputs.id,
        type: Action.Types.CARD_COMMENT,
      })
      .intercept('pathNotFound', () => Errors.COMMENT_ACTION_NOT_FOUND);

    let { action } = path;
    const { board, project } = path;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      if (action.userId !== currentUser.id) {
        throw Errors.COMMENT_ACTION_NOT_FOUND; // Forbidden
      }

      const boardMembership = await BoardMembership.findOne({
        boardId: board.id,
        userId: currentUser.id,
      });

      if (!boardMembership) {
        throw Errors.COMMENT_ACTION_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR && !boardMembership.canComment) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = {
      data: _.pick(inputs, ['text']),
    };

    action = await sails.helpers.commentActions.updateOne.with({
      values,
      board,
      record: action,
      currentUser,
      request: this.req,
    });

    if (!action) {
      throw Errors.COMMENT_ACTION_NOT_FOUND;
    }

    return {
      item: action,
    };
  },
};
