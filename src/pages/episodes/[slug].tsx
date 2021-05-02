import { useRouter } from 'next/router'
import ptBR from 'date-fns/locale/pt-BR'
import { format, parseISO } from 'date-fns'
import { convertDurationToTimeString } from '../../utils/convertDuratinToTimeString'
import Image from 'next/image'

import { GetStaticPaths, GetStaticProps } from 'next'
import api from '../../services/api'
import styles from './episode.module.scss'
import { usePlayer } from '../../contexts/PlayerContext'
import Head from 'next/head'

type Episode = {
  id: string
  title: string
  members: string
  published_at: Date
  thumbnail: string
  duration: number
  durationAsString: string
  description: string
  url: string
}

type EpisodeProps = {
  episode: Episode
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get(
    '/',

    {
      params: {
        _limit: 2,
        _sort: 'publish_at',
        _order: 'desc',
      },
    }
  )

  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    }
  })

  return data
}

function episode({ episode }: EpisodeProps) {
  const router = useRouter()

  const { play } = usePlayer()

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <button type="button">
          <img src="/arrow-left.svg" alt="voltar" />
        </button>
        <Image width={700} height={160} src={episode.thumbnail} objectFit="cover" />

        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="tocar" />
        </button>
      </div>

      <header>
        <h1 style={{ paddingBottom: '24px', paddingTop: '24px' }}>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.published_at}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params
  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    published_at: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  }

  return {
    props: { episode },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}

export default episode
