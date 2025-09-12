import Header from './header';
import Slide from './slide';
import Content from './content';

export default function Layout() {

  return (
      <div className='overflow-hidden'>
        <Header />
        <Slide />
        <Content />
      </div>
  );
}

