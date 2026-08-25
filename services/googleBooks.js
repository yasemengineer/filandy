export async function searchBooks(query) {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,subject,number_of_pages_median,publisher`
    );
    const data = await response.json();
    if (!data.docs) return [];
    return data.docs.map(item => ({
      id: item.key,
      title: item.title || 'Başlık Yok',
      authors: item.author_name?.join(', ') || 'Yazar Bilinmiyor',
      description: item.subject?.slice(0, 5).join(', ') || 'Açıklama bulunamadı.',
      thumbnail: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : null,
      largeThumbnail: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : null,
      pageCount: item.number_of_pages_median || 0,
      publisher: item.publisher?.[0] || 'Bilinmiyor',
      publishedDate: item.first_publish_year?.toString() || '',
      language: item.language?.[0] === 'tur' ? 'Türkçe' : item.language?.[0] === 'eng' ? 'İngilizce' : item.language?.[0] === 'ger' ? 'Almanca' : item.language?.[0] === 'fre' ? 'Fransızca' : item.language?.[0] ? item.language[0] : '',      categories: item.subject?.slice(0, 3) || [],
      averageRating: 0,
      ratingsCount: 0,
      previewLink: `https://openlibrary.org${item.key}`,
      infoLink: `https://openlibrary.org${item.key}`,
      pdf: null,
      epub: null,
      isbn: '',
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}