const SPACEBAR = ' '

const NONE = 'none'
const INLINE = 'inline'

/**
 * Linked list used to store 
 * the videos in the timeline 
 */
class TimelineNode {
  constructor(data) {
    this.data = data
    this.next = null
    this.prev = null              
  }
}

window.onload = () => {
  RATIO = 1.77 // 4:3=1.33 1:2=0.5
  window.FFMPEG_RESOLUTION_WIDTH = 1920
  window.FFMPEG_RESOLUTION_HEIGHT = 1080

  const win = $(window)
  if (win.height() < 602 || win.width() < 815) {
    
    document.querySelector('.edit-workspace').style.display = 'none'
    document.querySelector('.startup-wrapper').style.display = 'none'
    if (win.height() < 602)
      document.querySelector('#small-screen-placeholder-message').innerHTML = 
        "You need to use a <b>bigger screen size</b> to use the editor. Increase the <b>height</b> of the window and hit <b>refresh</b>"
    else {
      document.querySelector('#small-screen-placeholder-message').innerHTML = 
        "You need to use a <b>bigger screen size</b> to use the editor. Increase the <b>width</b> of the window and hit <b>refresh</b>"
    }
        document.querySelector('#small-screen-placeholder-wrapper').style.display = 'grid'
  }
  
  this.resources = {}
  /* Currently hardcoding the default video items */
  // this.resources[getUniqueID()] = buildVideoResourceByPath('./static/resources/GrahamScan.mov', 'GrahamScan.mov')
  // this.resources[getUniqueID()] = buildVideoResourceByPath('./static/resources/PostItDemo.mp4', 'PostItDemo.mp4')
  // this.resources[getUniqueID()] = buildVideoResourceByPath('./static/resources/bunny.mp4', 'bunny.mp4')
  // this.resources[getUniqueID()] = buildVideoResourceByPath('./static/resources/bunny2.mp4', 'bunny2.mp4')
  // this.resources[getUniqueID()] = buildVideoResourceByPath('./static/resources/portait.mp4', 'portait.mp4')
  // this.resources[getUniqueID()] = buildVideoResourceByPath('./static/resources/bunny10sec.mp4', 'bunny10sec.mp4')

  document.body.onkeyup = keyUpEvent
  document.body.onkeydown = keyDownEvent

  window.currentMouseDownEvent = null;

  timelinePlaceholder = document.createElement('div')
  timelinePlaceholder.classList.add('timeline-item')
  
  /* References to the timeline canvas */
  timelineCanvas = document.querySelector('#timeline-canvas')
  timelineCanvasCtx = timelineCanvas.getContext('2d')

  /* References to the video preview canvas */
  canvasWrapper = document.querySelector('.preview-player-wrapper')
  canvas = document.querySelector('.preview-player')
  context = canvas.getContext('2d')

  /* References to the playback controls */
  playButton = document.querySelector('.preview-play')
  pauseButton = document.querySelector('.preview-pause')
  backwardButton = document.querySelector('.preview-back')
  forwardButton = document.querySelector('.preview-forward')

  /* Setting the event listeners for backward and forward buttons */
  backAndForwardButtonLogic(backwardButton, forwardButton)

  /* Context menu HTML element */
  contextMenu = document.querySelector('#context-menu')
  $(document).bind('click', function() { 
    $(contextMenu).hide()
  })

  document.addEventListener('mousedown', (ctx) => {
    if (window.currentlyTrimming) {
      [video, trimElement, doneBtn] = window.currentlyTrimming
      if (ctx.target !== video && ctx.target !== trimElement && ctx.target !== doneBtn) {
        cancelTrimming()
      }
    }
  })

  splitVideoBtn = document.querySelector('#split-video')
  splitVideoBtn.addEventListener('click', () => splitVideo(window.rightClickCtx))

  deleteVideoBtn = document.querySelector('#delete-video')
  deleteVideoBtn.addEventListener('click', () => deleteVideo(window.rightClickCtx))

  trimVideoBtn = document.querySelector('#trim-video')
  trimVideoBtn.addEventListener('click', () => renderTrimBars(window.rightClickCtx))

  trimDoneBtn = document.querySelector('#trim-modal-done')
  trimDoneBtn.addEventListener('click', doneTrimming)

  fitStrechBtn = document.querySelector('#fit-strech-video')
  fitStrechBtn.addEventListener('click', () => changeRatio(window.rightClickCtx))

  /* In the beginning, no video is currently playing */
  window.currentVideoSelectedForPlayback = null

  timelinePlaybackBar = document.querySelector('#timeline-playback-bar')

  /* Hash table with references to nodes in the linked 
     list will elaborate after further implementations */
  window.references = {}
  
  window.rerenderFrame = renderUIAfterFrameChange

  /* Rendering the video resources */
  renderResourcesBlock()
  window.renderResources = renderResourcesBlock
  window.buildResource = buildVideoResourceByPath

  /* No video is playing by default */
  setCurrentlyPlaying(false)

  /* Playing and pausing will trigger the
     same action as hitting the space bar*/
  playButton.addEventListener('click', triggerPlayVideo)
  pauseButton.addEventListener('click', triggerPlayVideo)
 
  /* Video duration selectors */
  finalVideoDurationLabel = document.querySelector('#full-video-duration')
  currentVideoDurationLabel = document.querySelector('#current-video-duration')
  
  modalWrapper = document.querySelector('.modal-wrapper')
  donePreview = document.querySelector('#preview-done')
  closeModalBtn = document.querySelector('.close-modal')

  modalWrapper.addEventListener('click', closeModal)
  closeModalBtn.addEventListener('click', closeModal)
  donePreview.addEventListener('click' , donePreviewClicked)

  logText = document.getElementById('load-logs')
  progressBar = document.getElementById('progress-bar')
  loadingWrapper = document.querySelector('.loading-wrapper')
  defaultModalContent = document.querySelector('.default-modal-content')
  
  timelinePlaceholderText = document.querySelector('.timeline-placeholder-text')
  resourcesPlaceholder = document.querySelector('.resources-placeholder')

  const uploader = document.getElementById("uploader")
  uploader.addEventListener("change", fileUpload)

  const startupWrapper = document.querySelector('.startup-wrapper')
  const workspace = document.querySelector('.edit-workspace')

  workspace.addEventListener('dragover', function(e) {
    e.preventDefault()
    e.stopPropagation()
    resourcesPlaceholder.style.transform = 'scale(0.8)'
  }, false)
  workspace.addEventListener('dragenter', function(e)  {
    e.preventDefault()
    e.stopPropagation()
  }, false)
  workspace.addEventListener('dragleave', function(e)  {
    e.preventDefault()
    e.stopPropagation()
    resourcesPlaceholder.style.transform = 'none'
  }, false)
  workspace.addEventListener('drop', (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropUpload(e.dataTransfer.files)
  }, false)

  setTimeout(() => {
    workspace.style.display = 'flex'
    startupWrapper.children[0].style.animation = 'disappear 0.5s'
    startupWrapper.style.animation = 'unblur 0.5s'
    setTimeout(() => {
      startupWrapper.style.display = 'none'
    }, 400)
    const toggleActive = document.querySelector('.toggle-active')
    const toggleSetting = document.querySelector('.toggling-layer')
    handleTogglingLayer.call(toggleActive, toggleSetting)
  }, 500)
  
}


/**
 * Method for rendering the playback
 * bar on the timeline canvas
 * @param videoElement TimelineNode element
 */
function renderCurrentPlaybackBar(videoNode) {
  let videoElement = videoNode.data.videoCore
  
  let currentTime = videoNode.data.videoCore.currentTime - videoNode.data.metadata.startTime

  window.currentPlaybackTime = videoElement.offsetLeft + 
    (currentTime * videoElement.clientWidth / videoNode.data.metadata.duration)
  
  timelinePlaybackBar.style.left = `${window.currentPlaybackTime}px`
}


/**
 * Method that switches back 
 * from the trimming state 
 */
function cancelTrimming() {
  modal = document.querySelector('#trim-modal')
  modal.style.display = 'none'

  modal.parentNode.replaceChild(modal.cloneNode(true), modal)
  window.currentlyTrimming = undefined
  trimDoneBtn = document.querySelector('#trim-modal-done')
  trimDoneBtn.addEventListener('click', doneTrimming)
}

/**
 * Method that switches back from
 * the trimming state after saving
 */
function doneTrimming(_) {
  modal = document.querySelector('#trim-modal')
  modal.style.display = 'none'
  
  startTimeModal = document.querySelector('#trim-modal-start-time')
  endTimeModal = document.querySelector('#trim-modal-end-time')

  const currentlyTrimmingId = window.currentlyTrimming[0].id

  window.timelineDuration -= 
    window.references[currentlyTrimmingId].data.metadata.duration - 
    Number(endTimeModal.innerText) + Number(startTimeModal.innerText)

  window.references[currentlyTrimmingId]
    .data.metadata.startTime = Number(startTimeModal.innerText)
  window.references[currentlyTrimmingId]
    .data.metadata.endTime = Number(endTimeModal.innerText)
  window.references[currentlyTrimmingId]
    .data.metadata.duration = Number(endTimeModal.innerText) - Number(startTimeModal.innerText)

  /* Update the baseDuration for every item to the right */
  let iterator = window.references[window.currentlyTrimming[0].id].next
  while (iterator) {
    iterator.data.metadata.baseDuration = 
      iterator.prev.data.metadata.baseDuration + 
      iterator.prev.data.metadata.duration
    iterator = iterator.next
  }
  renderPreviousTimelineDimensions()
  
  finalVideoDurationLabel.innerText = formatTimeFromSeconds(window.timelineDuration.toFixed(2))
  modal.parentNode.replaceChild(modal.cloneNode(true), modal)
  window.currentlyTrimming = undefined

  trimDoneBtn = document.querySelector('#trim-modal-done')
  trimDoneBtn.addEventListener('click', doneTrimming)

  window.timeline.data.videoCore.currentTime = window.timeline.data.metadata.startTime
  window.currentVideoSelectedForPlayback = window.timeline
  renderUIAfterFrameChange(window.timeline)
}

/**
 * Initializing the trimming functionality
 */
function renderTrimBars(ctx) {
  modal = document.querySelector('#trim-modal')
  startTimeModal = document.querySelector('#trim-modal-start-time')
  endTimeModal = document.querySelector('#trim-modal-end-time')
  trimDoneBtn = document.querySelector('#trim-modal-done')
  startTimeModal.innerText = '0.00'
  endTimeModal.innerText = window.references[ctx.target.id].data.metadata.duration.toFixed(2)

  window.currentlyTrimming = [ctx.target, modal, trimDoneBtn]

  /* UI updated */
  modal.style.display = 'block'
  modal.style.left = `${ctx.target.getBoundingClientRect().left}px`
  modal.style.top = `${ctx.target.getBoundingClientRect().top}px`
  modal.style.width = `${ctx.target.clientWidth}px`

  const BORDER_SIZE = 10;
  var panel = modal
  let m_pos;

  function resizeLeft(mouseEvent) {
    var panelSizes = getComputedStyle(panel, '')
    var targetSizes = ctx.target.getBoundingClientRect()

      if (mouseEvent.x >= targetSizes.left && 
          mouseEvent.x < parseInt(panelSizes.left) + (parseInt(panelSizes.width))) {

        var dx = m_pos - mouseEvent.x
        m_pos = mouseEvent.x
        panel.style.left = `${parseInt(panelSizes.left) - dx}px`
        panel.style.width = `${parseInt(panelSizes.width) + dx}px`

        startTimeModal.innerText = (
          (mouseEvent.x - ctx.target.offsetLeft) *
          window.references[ctx.target.id].data.metadata.duration /
          ctx.target.clientWidth
        ).toFixed(2)
    }
  }

  function resizeRight(mouseEvent) {
    let panelSizes = getComputedStyle(panel, '')
    let targetSizes = ctx.target.getBoundingClientRect()
    if (mouseEvent.x <= targetSizes.right && 
        mouseEvent.x > (parseInt(panelSizes.left))) {
      
      const dx = m_pos - mouseEvent.x
      m_pos = mouseEvent.x
      panel.style.width = `${parseInt(panelSizes.width) - dx}px`
      
      endTimeModal.innerText = (
        (mouseEvent.x - ctx.target.offsetLeft) * 
        window.references[ctx.target.id].data.metadata.duration /
        ctx.target.clientWidth
      ).toFixed(2)
    }
  }

  function mouseDown(e) {
    if (e.offsetX < BORDER_SIZE) {
      m_pos = e.x
      document.addEventListener("mousemove", resizeLeft, false)
    } else if (e.offsetX > parseInt(getComputedStyle(panel, '').width) - BORDER_SIZE) {
      m_pos = e.x
      document.addEventListener("mousemove", resizeRight, false)
    }
  }
  
  panel.addEventListener("mousedown", mouseDown, false);

  document.addEventListener("mouseup", function() {
    document.removeEventListener("mousemove", resizeLeft, false);
    document.removeEventListener("mousemove", resizeRight, false);
  }, false);
}




/**
 * Method that replaces the dot with ':'
 * and converts the current time to string
 * @param time double with two decimals
 */
function formatTimeFromSeconds(time) {
  const totalSeconds = time | 0
  const minutes = parseInt(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const secondsString = (seconds < 10) ? `0${seconds}` : `${seconds}`
  return `${minutes}:${secondsString}`
}


/**
 * Updates the preview panel with 
 * the latest timelineDuration value
 */
function renderTimelineDimensions(currentItemDuration) {
  let iterator = window.timeline    
  if (!iterator) {
    return 1
  }

  const currentDuration = window.timelineDuration + currentItemDuration
  while (iterator) {
    iterator.data.videoCore.style.flexGrow = iterator.data.metadata.duration / currentDuration
    iterator = iterator.next
  }
  return currentItemDuration / currentDuration
}


function renderPreviousTimelineDimensions() {
  let iterator = window.timeline    
  if (!iterator) {
   return
  }

  const currentDuration = window.timelineDuration
  while (iterator) {
    iterator.data.videoCore.style.flexGrow = iterator.data.metadata.duration / currentDuration
    iterator = iterator.next
  }

}



function timelineMove(ctx) {
  window.currentVideoTime = 
    ctx.offsetX * 
    window.references[ctx.target.id].data.metadata.duration / 
    ctx.target.clientWidth
}

function timelineLeave(ctx) {
  window.currentVideoTime = null
}


function timelineClick(ctx) {
  ctx.target.currentTime = 
    window.references[ctx.target.id].data.metadata.startTime + 
    ctx.offsetX * 
    window.references[ctx.target.id].data.metadata.duration / 
    ctx.target.clientWidth
      
  setCurrentlyPlaying(false)

  window.currentVideoSelectedForPlayback = window.references[ctx.target.id]
  renderUIAfterFrameChange(window.currentVideoSelectedForPlayback)
}


/**
 * Object that has the logic responsible
 * for dragging and dropping all video items
 */
const dragObjectLogic = {

  scroll: false,
  
  start : function (event, helper) {
    if (2 * event.pageY > $(window).height()) {
      try {
        timelinePlaceholder.style.flexGrow = event.target.style.flexGrow
        event.target.style.width = event.target.getBoundingClientRect().width
        document.querySelector('.dragging-item').style.top = `${helper.offset.top}px`
        document.querySelector('.dragging-item').style.left = `${helper.offset.left}px`
        $('.dragging-item').append(event.target)
        
      } catch (error) {
        /* dragging started too soon */
      }
    }
    setCurrentlyPlaying(false)
    if (!window.references[event.target.id]) {
      timelinePlaceholder.style.flexGrow = renderTimelineDimensions(event.target.duration)
    }
    
    event.target.style.zIndex = '150'
    event.target.style.animation = 'pickup 0.5s'
    event.target.style.boxShadow = '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22'
    event.target.style.transform = 'scale(1.15)'
    event.target.style.transition = 'none'
  },

  
  drag: function (event, helper) {
    if (2 * event.pageY > $(window).height()) {
      timelinePlaceholder.style.display = 'block'
      childrenNodesTimeline = $('.timeline').children()
      if (!childrenNodesTimeline.length) {
        if ($('.timeline').last()[0] !== timelinePlaceholder) {
          $('.timeline').prepend(timelinePlaceholder)
        }
      } else {
        let refNode = null;
        for (child of childrenNodesTimeline) {
          const childThreshold = child.offsetLeft + child.clientWidth / 2
          const targetThreshold = event.target.getBoundingClientRect().width / 2
          if (targetThreshold > 800) {
            if (child != event.target && childThreshold > helper.offset.left + targetThreshold) {
              refNode = child
              break;
            }
          } else {
            if (child != event.target && childThreshold > event.pageX) {
              refNode = child
              break;
            }
          }
        }

        if (refNode) {
          if ($(child).prev()[0] !== timelinePlaceholder) {
            $(timelinePlaceholder).insertBefore(child)
          }
        } else {
          if (childrenNodesTimeline.last()[0] !== timelinePlaceholder) {
            $('.timeline').append(timelinePlaceholder)
          }
        }
      }
    }
  },
  

  stop : function (event, helper) {
    
    timelinePlaceholderText.remove()
    timelinePlaceholder.style.display = 'none'
    // event.target.style.position = 'relative'
    event.target.style.boxShadow = 'none'
    event.target.style.transform = 'scale(1)'

    const currentNode = window.references[event.target.id]
    if (currentNode) {
      replaceTimelinePlaceholder(event.target)
      arrangeWindowTimeline()
      return 
    }
    
    
    if (2 * event.pageY > $(window).height()) { 
      if (window.references[event.target.id]) {
        event.target.style.width = 'unset'
      } else {
        event.target.parentNode.remove()
      }
      
      $(timelinePlaceholder).replaceWith(event.target)
      event.target.classList.remove('item')
      event.target.classList.add('timeline-item')
      event.target.style.animation = 'fadein 0.5s'
      event.target.style.transition = '0.5s'

      event.target.addEventListener('mousemove', (ctx) => {
        timelineMove(ctx)
      })
      event.target.addEventListener('mouseleave', (ctx) => {
        timelineLeave(ctx)
      })
      event.target.addEventListener('click', (ctx) => {
        timelineClick(ctx)
      })
      event.target.addEventListener('contextmenu', (ctx) => {
        $(contextMenu).hide()
        timelineClick(ctx)
        rightClickMenu(ctx)
      }, false);

      arrangeWindowTimeline()
      if (document.querySelector('.item-wrapper') === null) {
         /* No pending items are left */
        resourcesPlaceholder.style.display = 'block'
      }
    } else {
      event.target.style.transition = '0.5s'  
    }

    renderPreviousTimelineDimensions()
    event.target.style.left = '0'
    event.target.style.top = '0'
    
  }

};
