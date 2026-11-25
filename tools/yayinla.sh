#!/usr/bin/env bash
# Siteyi derler ve FTPS ile https://pofitostudio.com/ köküne yükler.
# Giriş bilgisi depo dışında: C:/Users/<kullanıcı>/.bocuk/ftp.netrc (Böcük Roll ile ortak).
# Yalnız değişen dosyalar gider (özetler .yuklenen içinde); index.html en son yüklenir.
# public_html/bocukroll/ klasörüne dokunmaz.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd -W)"
NETRC="C:/Users/$USERNAME/.bocuk/ftp.netrc"
SUNUCU="senius.alastyr.com"
UZAK="public_html"
DIST="$ROOT/dist"
KAYIT="$ROOT/.yuklenen"
[ -f "$NETRC" ] || { echo "HATA: FTP bilgisi yok: $NETRC"; exit 1; }
(cd "$ROOT" && npm run lint && npm run build) || exit 1
touch "$KAYIT"
n=0
yukle() {
  f="$1"
  ozet="$(md5sum "$DIST/$f" | cut -d' ' -f1)"
  grep -qF "$ozet  $f" "$KAYIT" && return 0
  if curl -s -S -m 300 --netrc-file "$NETRC" --ssl-reqd --ftp-create-dirs -T "$DIST/$f" "ftp://$SUNUCU/$UZAK/$f"; then
    grep -vF "  $f" "$KAYIT" > "$KAYIT.yeni"; echo "$ozet  $f" >> "$KAYIT.yeni"; mv "$KAYIT.yeni" "$KAYIT"
    echo "yuklendi: $f"; n=$((n+1))
  else
    echo "HATA: yuklenemedi: $f"; exit 1
  fi
}
cd "$DIST" || exit 1
for f in $(find . -type f ! -name index.html | sed 's|^\./||' | sort); do yukle "$f"; done
yukle index.html
echo "bitti: $n dosya yuklendi -> https://pofitostudio.com/"
