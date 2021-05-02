import { useContext, useRef, useEffect, useState } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext'
import styles from './styles.module.scss'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { convertDurationToTimeString } from '../../utils/convertDuratinToTimeString'

export default function Player() {
  const {
    episodeList,
    setPlayingState,
    currentEpisodeIndex,
    playNext,
    playPrevius,
    isPlaying,
    isShuffling,
    togglePlay,
    hasNext,
    hasPrevius,
    isLooping,
    toggleLoop,
    toggleShuffle,
    clearPalyinState,
  } = usePlayer()

  const audioRef = useRef<HTMLAudioElement>(null)
  const episode = episodeList[currentEpisodeIndex]
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!audioRef.current) {
      return
    }

    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount
    setProgress(amount)
  }

  function handleOnEndend() {
    if (hasNext) {
      playNext()
    } else {
      clearPalyinState()
    }
  }

  function setupProgress() {
    audioRef.current.currentTime = 0

    audioRef.current.addEventListener('timeupdate', (event) => {
      setProgress(Math.floor(audioRef.current.currentTime))
    })
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="playing" />
        <strong>Tocando Agora </strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image width={592} height={592} src={episode.thumbnail} objectFit="cover" />

          <strong>{episode.title}</strong>
          <br />
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}
      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>

          <div className={styles.slider}>
            {episode ? (
              <Slider
                onChange={handleSeek}
                max={episode.duration}
                value={progress}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
          {episode && (
            <audio
              // onPlay={() => setPlayingState(true)}
              // onPause={() => setPlayingState(false)}
              ref={audioRef}
              src={episode.url}
              autoPlay
              loop={isLooping}
              onLoadedMetadata={setupProgress}
              onEnded={handleOnEndend}
            />
          )}
        </div>
        <div className={styles.buttons}>
          <button
            type="button"
            className={isShuffling ? styles.isActive : ''}
            onClick={toggleShuffle}
            disabled={!episode || episodeList.length === 1}
          >
            <img src="/shuffle.svg" alt="embaralhar" />
          </button>
          <button type="button" onClick={playPrevius} disabled={!episode || !hasPrevius}>
            <img src="/play-previous.svg" alt="tocar-anterior" />
          </button>

          <button type="button" disabled={false} onClick={togglePlay}>
            {isPlaying ? (
              <img src="/pause.svg" className={styles.playButton} alt="parar" />
            ) : (
              <img src="/play.svg" className={styles.playButton} alt="tocar" />
            )}
          </button>

          <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
            <img src="/play-next.svg" className={styles.playButton} alt="repetir" />
          </button>
          <button
            type="button"
            className={isLooping ? styles.isActive : ''}
            onClick={toggleLoop}
            disabled={!episode}
          >
            <img src="/repeat.svg" className={styles.playButton} alt="repetir" />
          </button>
        </div>
      </footer>
    </div>
  )
}
