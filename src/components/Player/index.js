import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/index';
import * as toggleTypes from '../../constants/toggleTypes';
import { addAccessTokenWith } from '../../services/api';
import ButtonInline from '../../components/ButtonInline';
import ReactTooltip from 'react-tooltip';
import Clipboard from 'react-clipboard.js';

class Player extends React.Component {

  componentDidUpdate() {
    const audioElement = ReactDOM.findDOMNode(this.refs.audio);

    if (!audioElement) { return; }

    const { isPlaying, volume } = this.props;
    if (isPlaying) {
      audioElement.play();
      audioElement.addEventListener('timeupdate', updateProgress, false);
    } else {
      audioElement.pause();
    }
    audioElement.volume = volume / 100;
  }

  renderNav() {
    const {
      currentUser,
      activeTrackId,
      isPlaying,
      entities,
      playlist,
      isInShuffleMode,
      onSetToggle,
      onActivateIteratedTrack,
      onLike,
      onTogglePlayTrack,
      onSetShuffleMode,
      volume
    } = this.props;

    if (!activeTrackId) { return null; }

    const track = entities.tracks[activeTrackId];
    const { user, title, stream_url } = track;
    const { username } = entities.users[user];

    const isMuted = !volume;

    const muteClass = classNames(
      'fa',
      {
        'fa-volume-up': !isMuted,
        'fa-volume-off': isMuted,
      }
    );

    const playClass = classNames(
      'fa',
      {
        'fa-pause': isPlaying,
        'fa-play': !isPlaying
      }
    );

    const likeClass = classNames(
      'fa fa-heart',
      {
        'is-favorite': track.user_favorite
      }
    );

    const shuffleClass = classNames(
      'fa fa-random',
      {
        randomSelected: isInShuffleMode
      }
    );

    return (
      <div className="player-container">
        <div className="player-status">
          <div id="player-status-bar" className="player-status-bar"></div>
        </div>
        <div className="player-content">
          <div className="player-content-action">
            <ButtonInline onClick={() => onActivateIteratedTrack(activeTrackId, -1)}>
              <i className="fa fa-step-backward" />
            </ButtonInline>
          </div>
          <div className="player-content-action">
            <ButtonInline onClick={() => onTogglePlayTrack(!isPlaying)}>
              <i className={playClass} />
            </ButtonInline>
          </div>
          <div className="player-content-action">
            <ButtonInline onClick={() => onActivateIteratedTrack(activeTrackId, 1)}>
              <i className="fa fa-step-forward" />
            </ButtonInline>
          </div>
          <div className="player-content-name">
            {username} - {title}
          </div>
          <div className="player-content-action">
            <ButtonInline onClick={() => onSetToggle(toggleTypes.PLAYLIST)}>
              <i className="fa fa-th-list" /> {playlist.length}
            </ButtonInline>
          </div>
          <div className="player-content-action">
            <ButtonInline onClick={onSetShuffleMode}>
              <i className={shuffleClass} />
            </ButtonInline>
          </div>
          <div className="player-content-action">
            <ButtonInline onClick={() => onSetToggle(toggleTypes.VOLUME)}>
              <i className={muteClass} />
            </ButtonInline>
          </div>
          <div className="player-content-action">
            {
              currentUser ?
              <ButtonInline onClick={() => onLike(track)}>
                <i className={likeClass} />
              </ButtonInline> : null
            }
          </div>
          <div className="player-content-action">
            <a data-tip data-for="global">
              <Clipboard component="a" data-clipboard-text={track.permalink_url}>
                  <div className="player-content-link">
                    <i className="fa fa-share" />
                  </div>
              </Clipboard>
            </a>
            <ReactTooltip id="global" event="click" aria-haspopup="true">
              <p>Song URL copied!</p>
            </ReactTooltip>
          </div>
          <audio id="audio" ref="audio" src={addAccessTokenWith(stream_url, '?')}></audio>
        </div>
      </div>
    );
  }

  render() {
    const playerClass = classNames(
      'player',
      {
        'player-visible': this.props.activeTrackId
      }
    );

    return <div className={playerClass}>{this.renderNav()}</div>;
  }

}

function updateProgress(event) {
  const statusbar = document.getElementById('player-status-bar');
  let val = 0;
  if (event.target.currentTime > 0) {
    val = ((100 / event.target.duration) * event.target.currentTime).toFixed(2);
  }
  statusbar.style.width = val + "%";
}

function mapStateToProps(state) {
  return {
    currentUser: state.session.user,
    activeTrackId: state.player.activeTrackId,
    isPlaying: state.player.isPlaying,
    entities: state.entities,
    playlist: state.player.playlist,
    isInShuffleMode: state.player.isInShuffleMode,
    volume: state.player.volume,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onTogglePlayTrack: bindActionCreators(actions.togglePlayTrack, dispatch),
    onSetToggle: bindActionCreators(actions.setToggle, dispatch),
    onActivateIteratedTrack: bindActionCreators(actions.activateIteratedTrack, dispatch),
    onLike: bindActionCreators(actions.like, dispatch),
    onSetShuffleMode: bindActionCreators(actions.toggleShuffleMode, dispatch),
  };
}

Player.propTypes = {
  currentUser: React.PropTypes.object,
  activeTrackId: React.PropTypes.number,
  isPlaying: React.PropTypes.bool,
  entities: React.PropTypes.object,
  playlist: React.PropTypes.array,
  onTogglePlayTrack: React.PropTypes.func,
  onSetToggle: React.PropTypes.func,
  onActivateIteratedTrack: React.PropTypes.func,
  onLike: React.PropTypes.func,
  onSetShuffleMode: React.PropTypes.func,
  isInShuffleMode: React.PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(Player);
