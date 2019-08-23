const loadedLinks = new Set()
const loadingMap = new Map()

export function loadJS (url) {
  if (loadedLinks.has(url)) {
    return Promise.resolve(false)
  } else if (loadingMap.has(url)) {
    return loadingMap.get(url)
  }
  // https://stackoverflow.com/questions/14521108/dynamically-load-js-inside-js/14521217#14521217

  // url is URL of external file, implementationCode is the code
  // to be called from the file, location is the location to
  // insert the <script> element

  const scriptTag = document.createElement('script')
  scriptTag.type = 'text/javascript'

  const promise = new Promise((resolve, reject) => {
    scriptTag.onload = () => {
      loadedLinks.add(url)
      loadingMap.delete(url)
      resolve(true)
    }
    scriptTag.onreadystatechange = () => resolve()
    scriptTag.onerror = () => reject(
      new Error(`Load script '${url}' failed`))
    scriptTag.src = url
    document.head.appendChild(scriptTag)
  })

  loadingMap.set(url, promise.then(() => false))
  return promise
}

export function loadCSS (url) {
  if (loadedLinks.has(url)) {
    return
  } else {
    loadedLinks.add(url)
  }
  // https://stackoverflow.com/questions/51649234/dynamically-load-css-stylesheet-in-link-tag
  const stylesheet = document.createElement('link')
  stylesheet.rel = 'stylesheet'
  stylesheet.type = 'text/css'
  stylesheet.href = url

  document.head.appendChild(stylesheet)
}
