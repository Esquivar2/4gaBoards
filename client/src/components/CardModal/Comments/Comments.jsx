import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize, Loader, LoaderSize } from '../../Utils';
import Comment from './Comment';
import CommentEdit from './CommentEdit';

import * as cStyles from '../CardModal.module.scss';
import * as s from './Comments.module.scss';

const Comments = React.memo(
  ({
    items,
    isFetching,
    isAllFetched,
    canEdit,
    canEditAllComments,
    commentMode,
    isGithubConnected,
    githubRepo,
    commentCount,
    preferredDetailsFont,
    boardMemberships,
    onFetch,
    onCommentCreate,
    onCommentUpdate,
    onCommentDelete,
    toggleCommShown,
    commShown,
    onUserPrefsUpdate,
  }) => {
    const [t] = useTranslation();
    const visibilityRef = useRef(null);
    const commentAddRef = useRef(null);

    const openAddComment = useCallback(() => {
      commentAddRef.current?.open();
    }, []);

    const handleCommentUpdate = useCallback(
      (id, data) => {
        onCommentUpdate(id, data);
      },
      [onCommentUpdate],
    );

    const handleCommentDelete = useCallback(
      (id) => {
        onCommentDelete(id);
      },
      [onCommentDelete],
    );

    const handleVisibilityChange = useCallback(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onFetch();
          }
        });
      },
      [onFetch],
    );

    useEffect(() => {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver(handleVisibilityChange, options);
      if (visibilityRef.current) {
        observer.observe(visibilityRef.current);
      }

      return () => {
        observer.disconnect();
      };
    }, [handleVisibilityChange, onFetch, items]);

    return (
      <div>
        <div className={cStyles.moduleHeader}>
          <Icon type={IconType.Comment} size={IconSize.Size20} className={cStyles.moduleIcon} />
          {t('common.actions')}
          {commentCount > 0 && <div className={cStyles.headerCount}>({commentCount})</div>}
          {canEdit && (
            <Button style={ButtonStyle.Icon} title={t('common.addComment')} onClick={openAddComment}>
              <Icon type={IconType.Plus} size={IconSize.Size10} className={cStyles.iconAddButton} />
            </Button>
          )}
          <Button style={ButtonStyle.Icon} title={t('common.toggleComments')} onClick={toggleCommShown} className={cStyles.buttonToggle}>
            <Icon type={commShown ? IconType.Minus : IconType.Plus} size={IconSize.Size10} className={s.icon} />
          </Button>
        </div>
        <div>
          {commShown && (
            <>
              {canEdit && (
                <CommentEdit
                  ref={commentAddRef}
                  defaultData={{ text: '' }}
                  placeholder={`${t('common.enterComment')} ${t('common.writeCommentHint')}`}
                  commentMode={commentMode}
                  isGithubConnected={isGithubConnected}
                  githubRepo={githubRepo}
                  preferredDetailsFont={preferredDetailsFont}
                  onUpdate={onCommentCreate}
                  onUserPrefsUpdate={onUserPrefsUpdate}
                >
                  <Button style={ButtonStyle.Default} content={t('common.addComment')} onClick={openAddComment} />
                </CommentEdit>
              )}
              <div className={s.comments}>
                {items.map((item) => (
                  <Comment
                    key={item.id}
                    data={item.data}
                    isPersisted={item.isPersisted}
                    user={item.user}
                    canEdit={(item.user.isCurrent && canEdit) || canEditAllComments}
                    commentMode={commentMode}
                    isGithubConnected={isGithubConnected}
                    githubRepo={githubRepo}
                    createdAt={item.createdAt}
                    createdBy={item.createdBy}
                    updatedAt={item.updatedAt}
                    updatedBy={item.updatedBy}
                    preferredDetailsFont={preferredDetailsFont}
                    boardMemberships={boardMemberships}
                    onUpdate={(data) => handleCommentUpdate(item.id, data)}
                    onDelete={() => handleCommentDelete(item.id)}
                    onUserPrefsUpdate={onUserPrefsUpdate}
                  />
                ))}
              </div>
            </>
          )}
          {isFetching ? commShown && <Loader size={LoaderSize.Normal} /> : !isAllFetched && <div ref={visibilityRef} />}
        </div>
      </div>
    );
  },
);

Comments.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetching: PropTypes.bool.isRequired,
  isAllFetched: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canEditAllComments: PropTypes.bool.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  commentCount: PropTypes.number.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onFetch: PropTypes.func.isRequired,
  onCommentCreate: PropTypes.func.isRequired,
  onCommentUpdate: PropTypes.func.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
  toggleCommShown: PropTypes.func.isRequired,
  commShown: PropTypes.bool.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

export default Comments;
