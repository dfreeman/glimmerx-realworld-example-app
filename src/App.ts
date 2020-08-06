import Component, { hbs } from '@glimmerx/component';


export default class App extends Component {
  static template = hbs`
    <div id="intro">
      <h1>hello, glimmerx!</h1>
      <h3>
        you can get started by editing <code>src/App.js</code>,
        and run tests by visiting <a href="./tests">/tests</a>
      </h3>
    </div>
  `;
}
