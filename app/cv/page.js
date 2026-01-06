import { getMarkdownContent } from '../../lib/markdown'
import { MDXRemote } from 'next-mdx-remote/rsc'
import CVButtons from '../../components/CVButtons'
import siteConfig from '../../site.config'
import Image from 'next/image'

export async function generateMetadata() {
  return {
    title: 'CV',
    description: `Curriculum Vitae of ${siteConfig.name} - ${siteConfig.role} at ${siteConfig.affiliation}`,
    openGraph: {
      title: `CV | ${siteConfig.title}`,
      description: `Curriculum Vitae of ${siteConfig.name} - ${siteConfig.role} at ${siteConfig.affiliation}`,
      url: `${siteConfig.siteUrl}/cv`,
      type: 'profile',
      images: [
        {
          url: siteConfig.profileImage || '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} CV`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `CV | ${siteConfig.title}`,
      description: `Curriculum Vitae of ${siteConfig.name} - ${siteConfig.role} at ${siteConfig.affiliation}`,
      images: [siteConfig.profileImage || '/images/og-image.png'],
    },
  }
}

export default function CVPage() {
  const cvFile = siteConfig.cvFile
  const isPdf = cvFile && cvFile.toLowerCase().endsWith('.pdf')
  const isImage = cvFile && (cvFile.toLowerCase().endsWith('.png') || cvFile.toLowerCase().endsWith('.jpg') || cvFile.toLowerCase().endsWith('.jpeg'))

  // Only load markdown content if no file is provided
  let content = null
  if (!cvFile) {
    const markdownData = getMarkdownContent('cv')
    content = markdownData.content
  }

  return (
    <article className="w-full">
      <div className="space-y-8 py-4">
        <header className="space-y-4 print:space-y-2">
          <div className="inline-block rounded-lg bg-gray-100 dark:bg-slate-800 px-3 py-1 text-sm font-medium text-gray-900 dark:text-white print:hidden">
            Curriculum Vitae
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight print:text-4xl">CV</h1>
            <CVButtons showDownload={!!cvFile} />
          </div>
        </header>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-700 to-transparent print:hidden"></div>

        {/* PDF Embed */}
        {isPdf && (
          <div className="w-full">
            <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-slate-900">
              <iframe
                src={cvFile}
                className="w-full h-[800px] md:h-[1000px]"
                title="CV PDF"
              />
            </div>
          </div>
        )}

        {/* Image Display */}
        {isImage && (
          <div className="w-full flex justify-center">
            <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-slate-900 max-w-4xl">
              <Image
                src={cvFile}
                alt="CV"
                width={800}
                height={1000}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        )}

        {/* Markdown Content with Professional Styling */}
        {!cvFile && content && (
          <div className="cv-content bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-8 md:p-12 max-w-4xl mx-auto print:border-0 print:shadow-none print:p-0">
            <div className="prose prose-lg prose-gray dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-gray-900 dark:prose-h2:border-slate-700
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
              prose-ul:my-3 prose-ul:space-y-1
              prose-li:text-gray-700 dark:prose-li:text-slate-300 prose-li:leading-relaxed
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              print:prose-h2:text-xl print:prose-h3:text-lg
              print:text-sm">
              <MDXRemote source={content} />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
