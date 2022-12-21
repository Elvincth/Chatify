const Index = () => {
  return <div></div>;
};


export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/chat',
      permanent: true,
    },
  }
}

export default Index;
