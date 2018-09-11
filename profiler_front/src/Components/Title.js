import React,{Component} from 'react';

class Title extends Component{
  render(){
    return(
      <div className="container text-center">
        <h1 className="display-4">{this.props.title}</h1>
      </div>
    );
  }
}
export default Title;
