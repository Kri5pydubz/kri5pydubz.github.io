// Fight of the Night config. videoId = latest fight (plays first); playlistId = the Fight of the Night playlist.
window.DUBZ_FOTN = { videoId: 'WthTT_jlRwg', playlistId: 'PLQdDqm27zkIE' };
(function(){
  function run(){
    var c=window.DUBZ_FOTN||{}, box=document.getElementById('fotn-player'); if(!box) return;
    var src='';
    if(c.videoId) src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(c.videoId)+(c.playlistId?'?list='+encodeURIComponent(c.playlistId):'');
    else if(c.playlistId) src='https://www.youtube-nocookie.com/embed/videoseries?list='+encodeURIComponent(c.playlistId);
    if(!src) return;
    box.innerHTML='<iframe src="'+src+'" title="Fight of the Night" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    box.classList.add('has-video');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
