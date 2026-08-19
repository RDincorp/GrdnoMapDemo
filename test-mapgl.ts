import { load } from '@2gis/mapgl';
load().then(mapgl => {
  console.log(mapgl.HtmlMarker !== undefined);
});
