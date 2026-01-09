'use client'

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { SynthesisOutput, ReferenceCard } from '@/lib/types'

// Register fonts
Font.register({
  family: 'Cormorant',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYrEtE.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3WmX5slCNuHLi8bLeY9MK7whWMhyjYpHtKky0.ttf', fontWeight: 600 },
  ]
})

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 600 },
  ]
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#0a0a0f',
    color: '#f0f0f5',
    fontFamily: 'Inter',
    fontSize: 10,
  },
  coverPage: {
    padding: 60,
    backgroundColor: '#0a0a0f',
    color: '#f0f0f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  serifTitle: {
    fontFamily: 'Cormorant',
    fontWeight: 600,
  },
  title: {
    fontSize: 48,
    marginBottom: 16,
  },
  oneLiner: {
    fontSize: 18,
    color: '#a0a0a8',
    fontStyle: 'italic',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 24,
    fontFamily: 'Cormorant',
    fontWeight: 600,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
    marginTop: 16,
    color: '#d0d0d8',
  },
  label: {
    fontSize: 9,
    color: '#808088',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  keyword: {
    backgroundColor: '#1a1a24',
    color: '#e0e0e8',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
  },
  keywordsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  gridRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
  },
  gridCol: {
    flex: 1,
    paddingRight: 12,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 4,
    paddingLeft: 12,
  },
  doItem: {
    color: '#4ade80',
  },
  dontItem: {
    color: '#f87171',
  },
  card: {
    backgroundColor: '#12121a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Cormorant',
    fontWeight: 600,
    marginBottom: 8,
  },
  shotNumber: {
    backgroundColor: '#2a2a38',
    borderRadius: 12,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    marginRight: 12,
  },
  shotHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shotDetail: {
    fontSize: 9,
    marginBottom: 4,
  },
  shotLabel: {
    color: '#808088',
    width: 60,
  },
  moodboardGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  moodboardImage: {
    width: 120,
    height: 120,
    objectFit: 'cover',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#606068',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    borderBottom: '1 solid #2a2a38',
    marginVertical: 16,
  },
  clusterCard: {
    backgroundColor: '#12121a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  clusterBadge: {
    backgroundColor: '#2a2a38',
    color: '#a0a0a8',
    padding: '2 8',
    borderRadius: 4,
    fontSize: 8,
    marginBottom: 8,
  },
})

interface PDFDocumentProps {
  board: {
    title: string
    synthesis_output: SynthesisOutput
  }
  cards: ReferenceCard[]
}

export function PDFDocument({ board, cards }: PDFDocumentProps) {
  const { synthesis_output: output } = board
  const imageCards = cards.filter(c => c.thumbnail_url)

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.label}>PHOTOSHOOT BRIEF</Text>
          <Text style={[styles.title, styles.serifTitle]}>{output.concept.title}</Text>
          <Text style={styles.oneLiner}>{output.concept.oneLiner}</Text>

          <View style={styles.separator} />

          <Text style={styles.paragraph}>{output.concept.description}</Text>

          <View style={styles.keywordsContainer}>
            {output.concept.keywords.map((kw, i) => (
              <Text key={i} style={styles.keyword}>{kw}</Text>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Creative Canvas</Text>
          <Text>{new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* Moodboard Page */}
      {imageCards.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={[styles.sectionTitle, styles.serifTitle]}>Moodboard</Text>
          <View style={styles.moodboardGrid}>
            {imageCards.slice(0, 12).map((card, i) => (
              card.thumbnail_url && (
                <Image key={i} src={card.thumbnail_url} style={styles.moodboardImage} />
              )
            ))}
          </View>
          <View style={styles.footer}>
            <Text>Creative Canvas</Text>
            <Text>Page 2</Text>
          </View>
        </Page>
      )}

      {/* Clusters Page */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, styles.serifTitle]}>Aesthetic Clusters</Text>

        {output.clusters.map((cluster, i) => (
          <View key={i} style={styles.clusterCard}>
            <Text style={styles.clusterBadge}>Look {i + 1}</Text>
            <Text style={styles.cardTitle}>{cluster.name}</Text>
            <Text style={[styles.paragraph, { fontSize: 10, color: '#a0a0a8' }]}>{cluster.summary}</Text>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Palette</Text>
                <Text style={{ fontSize: 9 }}>{cluster.palette.join(', ')}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Lighting</Text>
                <Text style={{ fontSize: 9 }}>{cluster.lighting.join(', ')}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Styling</Text>
                <Text style={{ fontSize: 9 }}>{cluster.styling.join(', ')}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.label}>Composition</Text>
                <Text style={{ fontSize: 9 }}>{cluster.composition.join(', ')}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text>Creative Canvas</Text>
          <Text>Page {imageCards.length > 0 ? 3 : 2}</Text>
        </View>
      </Page>

      {/* Direction Page */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, styles.serifTitle]}>Creative Direction</Text>

        {(['lighting', 'styling', 'composition'] as const).map((key) => {
          const block = output.direction[key]
          const titles = { lighting: 'Lighting', styling: 'Styling', composition: 'Composition' }
          return (
            <View key={key} style={styles.card}>
              <Text style={styles.cardTitle}>{titles[key]} Direction</Text>

              {block.bullets.map((bullet, i) => (
                <Text key={i} style={styles.listItem}>• {bullet}</Text>
              ))}

              <View style={[styles.gridRow, { marginTop: 12 }]}>
                <View style={styles.gridCol}>
                  <Text style={styles.label}>Do</Text>
                  {block.dos.map((item, i) => (
                    <Text key={i} style={[styles.listItem, styles.doItem]}>✓ {item}</Text>
                  ))}
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.label}>Don't</Text>
                  {block.donts.map((item, i) => (
                    <Text key={i} style={[styles.listItem, styles.dontItem]}>✗ {item}</Text>
                  ))}
                </View>
              </View>
            </View>
          )
        })}

        <View style={styles.footer}>
          <Text>Creative Canvas</Text>
          <Text>Page {imageCards.length > 0 ? 4 : 3}</Text>
        </View>
      </Page>

      {/* Shot List Page */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, styles.serifTitle]}>Shot List</Text>

        {output.shotList.map((shot, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.shotHeader}>
              <View style={styles.shotNumber}>
                <Text>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{shot.name}</Text>
                <Text style={{ fontSize: 9, color: '#a0a0a8' }}>{shot.intent}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.shotDetail}>
                  <Text style={styles.shotLabel}>Camera: </Text>{shot.camera}
                </Text>
                <Text style={styles.shotDetail}>
                  <Text style={styles.shotLabel}>Lighting: </Text>{shot.lighting}
                </Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.shotDetail}>
                  <Text style={styles.shotLabel}>Styling: </Text>{shot.styling}
                </Text>
                <Text style={styles.shotDetail}>
                  <Text style={styles.shotLabel}>Props: </Text>{shot.propsLocation}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text>Creative Canvas</Text>
          <Text>Page {imageCards.length > 0 ? 5 : 4}</Text>
        </View>
      </Page>

      {/* Do/Don't Summary Page */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, styles.serifTitle]}>Summary</Text>

        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <Text style={styles.subsectionTitle}>✓ Do</Text>
            {output.globalDos.map((item, i) => (
              <Text key={i} style={[styles.listItem, styles.doItem]}>• {item}</Text>
            ))}
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.subsectionTitle}>✗ Don't</Text>
            {output.globalDonts.map((item, i) => (
              <Text key={i} style={[styles.listItem, styles.dontItem]}>• {item}</Text>
            ))}
          </View>
        </View>

        {output.deliverables && output.deliverables.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.subsectionTitle}>Deliverables</Text>
            <View style={styles.keywordsContainer}>
              {output.deliverables.map((item, i) => (
                <Text key={i} style={styles.keyword}>{item}</Text>
              ))}
            </View>
          </View>
        )}

        {output.risks && output.risks.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.subsectionTitle}>Risks & Mitigations</Text>
            {output.risks.map((item, i) => (
              <View key={i} style={[styles.card, { padding: 12 }]}>
                <Text style={{ fontSize: 10, fontWeight: 500 }}>{item.risk}</Text>
                <Text style={{ fontSize: 9, color: '#4ade80', marginTop: 4 }}>→ {item.mitigation}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Creative Canvas</Text>
          <Text>Page {imageCards.length > 0 ? 6 : 5}</Text>
        </View>
      </Page>
    </Document>
  )
}

