package checkchow.back.config.user;

import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class UsuarioDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioService usuarioService;

    public UsuarioDetailsService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Override
    public UserDetails loadUserByUsername(String EmailUsuario) throws UsernameNotFoundException {
        Usuario usuario = usuarioService.getCorreo(EmailUsuario.toUpperCase())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + EmailUsuario));
        return new UsuarioDetails(usuario);
    }

}