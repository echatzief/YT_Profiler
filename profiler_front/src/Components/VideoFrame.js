import React,{Component} from 'react';
import YouTube from 'react-youtube';

class VideoFrame extends Component{
  render(){
    const opts = {
     height: '300',
     width: '300',
     playerVars: {
       autoplay: 0
     }
   };
    return(
      <div className="container" style={{display:this.props.videoFrameDisplay}}>
          <div className="row justify-content-center">
              <div className="text-center">
                 <YouTube videoId={this.props.selectedItemID} opts={opts}  />
              </div>
          </div>
      </div>
    );
  }
}

export default VideoFrame;
