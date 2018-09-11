import React, { Component } from 'react';
import Navbar from './Components/Navbar';
import Title from './Components/Title';
import Home from './Components/Home';
import Searchbar from './Components/Searchbar';
import Results from './Components/Results';
import VideoFrame from './Components/VideoFrame';
import './Components/css/App.css';
import axios from 'axios';


class App extends Component {
  constructor(){
    super();
    this.state=({
      myChannelName:'',            /* My Channel Name */
      myChannelID:'',              /* My Channel ID */
      searchCategory:'',           /* We can choose video or channel */
      mainNavbarDisplay:'block',   /* Display of the navbar menu at home page*/
      searchNavbarDisplay:'none',  /* Display of search bar */
      homeDisplay:'block',         /* Display of home page */
      searchInput:'',              /* The input of the search field*/
      returnData:[],               /* What search returns */
      selectedItemID:'',
      selectedPlaylist:'PLejQpIz0c38Jo886nSW7nu3b-zWSCfFs-',
      resultsDisplay:'none',
      videoFrameDisplay:'none',
      playlistDisplay:'none',
    });
  }

  componentDidMount(){

    /* We get the channel name using YT api through the server */
    axios.post('/getChannelName')
    .then(res=>{

      /* Set the channelID and name */
      this.setState({
        myChannelName:res.data.username,
        myChannelID:res.data.id,
      })

    });
  }

  /* Change the search category between channel and video */
  changeSearchCategory = (e)=>{
    this.setState({
      searchCategory:e.target.id,
      mainNavbarDisplay:'none',
      searchNavbarDisplay:'block',
      homeDisplay:'block',
    })
  }

  /* Go back to home */
  changeToHome =()=>{
    this.setState({
      searchCategory:'',
      mainNavbarDisplay:'block',
      searchNavbarDisplay:'none',
      homeDisplay:'block',
      resultsDisplay:'none',
      returnData:[],
      selectedItemID:'',
      videoFrameDisplay:'none',
      playlistDisplay:'none',
    });
  }

  /* Change the search input */
  changeSearchInput = (e)=>{
    this.setState({
      searchInput:e.target.value,
    });
  }

  /* Request the search objects */
  doSearch =()=>{

    var searchBox=this.state.searchInput;

    /* Search for video or channel*/
    if(this.state.searchCategory==="Video"){
      axios.post('/getVideoContent',{searchBox})
      .then(res=>{
        console.log(res.data.items);
        /* Save the data to state */
        this.setState({returnData:res.data.items});
      });
    }
    else if(this.state.searchCategory==="Channel"){
      axios.post('/getChannelContent',{searchBox})
      .then(res=>{
        console.log(res.data.items);
        /* Save the data to state */
        this.setState({returnData:res.data.items});
      });
    }
    else{
      axios.post('/getPlaylistContent',{searchBox})
      .then(res=>{
        console.log(res.data.items);
        /* Save the data to state */
        this.setState({returnData:res.data.items});
      });
    }

    /*Do the proper changes */
    this.setState({
        homeDisplay:'none',
        searchInput:'',
        resultsDisplay:'block',
    })
  }

  changeToSelectedItem = (e)=>{

    if(this.state.searchCategory==="Video"){
      this.setState({
        selectedItemID:e.target.id,
        resultsDisplay:'none',
        videoFrameDisplay:'block'
      });
    }
    else if(this.state.searchCategory==="Playlist"){
      this.setState({
        selectedItemID:e.target.id,
      });

      var searchBox=e.target.id; //We get the playlist id
      axios.post('/getPlaylistItems',{searchBox})
      .then(res=>{
        console.log(res.data.items);
        /* Save the data to state */
        this.setState({returnData:res.data.items,searchCategory:'videoPlaylist'});
      });

    }
    else if(this.state.searchCategory==="videoPlaylist"){
      this.setState({
        selectedItemID:e.target.id,
        searchCategory:'',
        resultsDisplay:'none',
        videoFrameDisplay:'block',
      });
    }
  }



  render() {
    return (
      <div>

        {/* My Channel Name */}
        <Title title={this.state.myChannelName}/>

        {/* The navbar menu */}
        <Navbar changeSearchCategory={this.changeSearchCategory}  navDis={this.state.mainNavbarDisplay}/>

        {/* Search bar */}
        <Searchbar
          searchDis={this.state.searchNavbarDisplay} changeToHome={this.changeToHome}
          changeSearchInput={this.changeSearchInput} searchInput={this.state.searchInput}
          doSearch={this.doSearch}  searchCategory={this.state.searchCategory}
          />

        {/* The home page */}
        <Home homeDisplay={this.state.homeDisplay}/>

        {/* The results from the search */}
        <Results theArray={this.state.returnData} changeToSelectedItem={this.changeToSelectedItem} resultsDisplay={this.state.resultsDisplay} type={this.state.searchCategory}/>

        {/* For the videos*/}
        <VideoFrame selectedItemID={this.state.selectedItemID} videoFrameDisplay={this.state.videoFrameDisplay}/>
        {/* For the playlist*/}


      </div>
    );
  }
}

export default App;
