# Font assets

폰트 파일 자체는 저장소/ZIP에 포함하지 않습니다. 아래 파일명을 그대로 이 폴더에 넣어주세요.

## LG Smart

- `LG_Smart_UI-Light.ttf` — 300
- `LG_Smart_UI-Regular.ttf` — 400
- `LG_Smart_UI-SemiBold.ttf` — 600
- `LG_Smart_UI-Bold.ttf` — 700

## Pretendard Std

- `PretendardStd-Thin.woff2` — 100
- `PretendardStd-ExtraLight.woff2` — 200
- `PretendardStd-Light.woff2` — 300
- `PretendardStd-Regular.woff2` — 400
- `PretendardStd-Medium.woff2` — 500
- `PretendardStd-SemiBold.woff2` — 600
- `PretendardStd-Bold.woff2` — 700
- `PretendardStd-ExtraBold.woff2` — 800
- `PretendardStd-Black.woff2` — 900

`src/styles.css`의 `@font-face`가 위 경로를 직접 참조합니다. 폰트 파일을 넣지 않은 상태에서는 Vite production build가 asset resolve 오류를 낼 수 있습니다.
