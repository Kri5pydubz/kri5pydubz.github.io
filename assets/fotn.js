// Fight of the Night config. Set playlistId to embed the whole playlist (latest first), or videoId for one video.
window.DUBZ_FOTN = { videoId: 'FgRxixqWvQ4', playlistId: '' };
(function(){
  function run(){
    var c=window.DUBZ_FOTN||{}, box=document.getElementById('fotn-player'); if(!box) return;
    var src='';
    if(c.playlistId) src='https://www.youtube-nocookie.com/embed/videoseries?list='+encodeURIComponent(c.playlistId);
    else if(c.videoId) src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(c.videoId);
    if(!src) return;
    box.innerHTML='<iframe src="'+src+'" title="Fight of the Night" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    box.classList.add('has-video');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
