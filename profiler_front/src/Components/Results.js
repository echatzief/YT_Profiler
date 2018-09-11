import React,{Component} from 'react';

class Results extends Component{
  renderTheVideos(item){
    if(this.props.type==='Video'){
      return(
        <div className="container">
            <div className="row justify-content-center">
                <div className="text-center">
                  <p>{item.snippet.title}</p>
                  <img src={item.snippet.thumbnails.medium.url} id={item.id.videoId}  onClick={this.props.changeToSelectedItem}/>
                </div>
            </div>
        </div>
      )
    }
    else if(this.props.type==='Playlist'){
      return(
        <div className="container">
            <div className="row justify-content-center">
                <div className="text-center">
                  <p>{item.snippet.title}</p>
                  <img src={item.snippet.thumbnails.medium.url} id={item.id.playlistId}  onClick={this.props.changeToSelectedItem}/>
                </div>
            </div>
        </div>
      )
    }
    else if(this.props.type==='videoPlaylist'){
      console.log('videoPlaylist');
      return(
        <div className="container">
            <div className="row justify-content-center">
                <div className="text-center">
                  <p>{item.snippet.title}</p>
                  <img src={item.snippet.thumbnails.medium.url} id={item.snippet.resourceId.videoId}  onClick={this.props.changeToSelectedItem}/>
                </div>
            </div>
        </div>
      )
    }

  }
  render(){
    return(
      <div style={{overflow:'auto',display:this.props.resultsDisplay}}>
        {this.props.theArray.map(item => this.renderTheVideos(item))}
      </div>
    );
  }
}

export default Results;
