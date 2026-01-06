import { getPageItems, getMarkdownContent } from '../../lib/markdown'
import siteConfig from '../../site.config'
import DynamicPage from '../../components/DynamicPage'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { mdxComponents } from '../../components/MDXComponents'

// Generate metadata for each collection/simple page
export async function generateMetadata({ params }) {
  const { page } = await params
  const singlePagePath = path.join(process.cwd(), 'content', `${page}.md`)

  // For simple pages (single .md file)
  if (fs.existsSync(singlePagePath)) {
    const fileContents = fs.readFileSync(singlePagePath, 'utf8')
    const matter = require('gray-matter')
    const { data } = matter(fileContents)

    const pageTitle = data.title || page.charAt(0).toUpperCase() + page.slice(1)
    const pageDescription = data.description || `${pageTitle} - ${siteConfig.name}`

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: `${pageTitle} | ${siteConfig.title}`,
        description: pageDescription,
        url: `${siteConfig.siteUrl}/${page}`,
        type: 'website',
        images: [
          {
            url: data.thumbnail || siteConfig.profileImage || '/images/og-image.png',
            width: 1200,
            height: 630,
            alt: pageTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} | ${siteConfig.title}`,
        description: pageDescription,
        images: [data.thumbnail || siteConfig.profileImage || '/images/og-image.png'],
      },
    }
  }

  // For collection pages (folder with multiple .md files)
  const pageTitle = page.charAt(0).toUpperCase() + page.slice(1)
  const pageDescription = `Browse ${page} by ${siteConfig.name}`

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: `${pageTitle} | ${siteConfig.title}`,
      description: pageDescription,
      url: `${siteConfig.siteUrl}/${page}`,
      type: 'website',
      images: [
        {
          url: siteConfig.profileImage || '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | ${siteConfig.title}`,
      description: pageDescription,
      images: [siteConfig.profileImage || '/images/og-image.png'],
    },
  }
}

// Generate static params for all content folders
export async function generateStaticParams() {
  const contentDirectory = path.join(process.cwd(), 'content')

  if (!fs.existsSync(contentDirectory)) {
    return []
  }

  const folders = fs.readdirSync(contentDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  return folders.map(folder => ({
    page: folder
  }))
}

export const dynamicParams = false

export default async function DynamicPageRoute({ params }) {
  const { page } = await params
  const contentDirectory = path.join(process.cwd(), 'content', page)

  // Check if this is a simple page (single .md file) or collection page (folder with multiple .md files)
  const singlePagePath = path.join(process.cwd(), 'content', `${page}.md`)

  // Simple page (e.g., content/about.md)
  if (fs.existsSync(singlePagePath)) {
    const fileContents = fs.readFileSync(singlePagePath, 'utf8')
    const matter = require('gray-matter')
    const { data, content } = matter(fileContents)

    return (
      <div className="w-full ">
        <div className="space-y-10 py-4">
          <header className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              {data.title || page.charAt(0).toUpperCase() + page.slice(1)}
            </h1>
            {data.description && (
              <p className="text-lg text-gray-600 dark:text-slate-400">{data.description}</p>
            )}
          </header>

          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkMath, remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, {
                      behavior: 'wrap',
                      properties: { className: ['anchor'] }
                    }],
                    rehypeKatex,
                    [rehypePrettyCode, {
                      theme: 'github-dark',
                      keepBackground: false
                    }]
                  ]
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Collection page (e.g., content/publications/ folder)
  if (!fs.existsSync(contentDirectory)) {
    notFound()
  }

  const pageConfig = siteConfig.pages?.[page] || {
    mode: 'grid',
    itemsPerPage: 12,
    columns: 3
  }

  const items = getPageItems(page)
  const serializableItems = JSON.parse(JSON.stringify(items))

  return (
    <div className="w-full">
      <div className="space-y-10">
        <header className="space-y-4">
          <div className="inline-block rounded-lg bg-gray-100 dark:bg-slate-800 px-3 py-1 text-sm font-medium text-gray-900 dark:text-white">
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Browse {page}
          </p>
        </header>

        <DynamicPage items={serializableItems} pageConfig={pageConfig} pageName={page} />
      </div>
    </div>
  )
}
