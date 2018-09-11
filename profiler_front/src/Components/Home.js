import React,{Component} from 'react';
import img from './back.png'

class Home extends Component{
  render(){
    return(
      <div className="text-center" style={{display:this.props.homeDisplay}}>
          <img src={img} className="img-fluid" alt="Responsive image"/>
      </div>
    );
  }
}
export default Home;
