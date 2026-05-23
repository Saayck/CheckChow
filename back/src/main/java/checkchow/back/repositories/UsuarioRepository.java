package checkchow.back.repositories;

import checkchow.back.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Usuario findByUsername(String username);
    Usuario findByEmail(String email);
}

