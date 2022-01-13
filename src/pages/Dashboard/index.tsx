import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Link} from 'react-router-dom';

import { api } from '../../services/api';
import { Title, Form ,Repos, Error } from './styles';
import logo from '../../assets/logo.svg';

interface IGithubRepository{
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export const Dashboard: React.FC = () => {
  // Estado para armazenar a lista de repositórios
  // O valor inicial vai ser dado através de uma busca no local storage onde se o mesmo estiver vazio, será um array vazio.
  const [repos, setRepos] = React.useState<IGithubRepository[]>(() => {
    //Função responsável por buscar no local Storage as informções.
    const storageRepos = localStorage.getItem('@GitCollectino: repositories');

    if(storageRepos){
      return JSON.parse(storageRepos);
    }
    return [];
  });
  //Estado para armazenar o o que está no input
  const [newRepo, setNewRepo] = React.useState('');
  // Estado para armazenar a mensagem de erro
  const [inputError, setInputError] = React.useState('');

  React.useEffect(() => {
    localStorage.setItem('@GitCollectino: repositories', JSON.stringify(repos));
  },[repos]);
  
  //Quando o input modificar ele vai redefinir o estado do newRepo.
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void{
    setNewRepo(event.target.value);
  }

  // Fazendo uma requisição atraves do envio do formulário para a Api e adicionando o repositório encontrado na lista de repositorios.
  async function handleAddRepo(event: React.FormEvent<HTMLFormElement>): Promise<void>{
    //Cancelando a ação padrão do formulário quando acionado o submit(Reload).
    event.preventDefault();
    // Verificando se a requisição foi feita com o input vazio.
    if(!newRepo){
      setInputError('Informe o username/repositório');
      return;
    }

    //Requisição do tipo get utilizando o que está contido dentro do newRepo.
    const response = await api.get<IGithubRepository>(`repos/${newRepo}`);

    const respository = response.data;

    // Adicionando o novo repositorio a lista de repositorios.
    setRepos([ ...repos, respository]);
    // "Zerando" o estado do Input.
    setNewRepo('');
  }

  return(
    <>
      <img src={logo} alt="GitCollection" />
      <Title>Catálogo de repositórios do GitHub</Title>

      <Form onSubmit={handleAddRepo}>
        <input type="text" placeholder="username/repository_name" 
              onChange={handleInputChange}
        />
        <button type="submit" >Buscar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repos>
        {repos.map(repository =>(
          <Link to={`/repositories/${repository.full_name}`} key={repository.full_name}>
            <img 
              src={repository.owner.avatar_url}
              alt={repository.owner.login} 
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
            <FiChevronRight size={20} />
          </Link>
        ))}  
      </Repos>
    </>
  );
};


