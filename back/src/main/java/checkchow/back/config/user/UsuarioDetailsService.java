package checkchow.back.config.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioService;


@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioService usuarioService;

    public UsuarioDetailsService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Override
    public UserDetails loadUserByUsername(String EmailUsuario) throws UsernameNotFoundException {
        Usuario usuario = usuarioService.getCorreo(EmailUsuario.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + EmailUsuario));
        return new UsuarioDetails(usuario);
    }

}