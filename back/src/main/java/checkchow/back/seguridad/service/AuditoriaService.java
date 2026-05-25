package checkchow.back.seguridad.service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.seguridad.dto.AuditoriaRequest;
import checkchow.back.seguridad.dto.AuditoriaResponse;
import checkchow.back.seguridad.entity.Auditoria;
import checkchow.back.seguridad.entity.Dispositivo;
import checkchow.back.seguridad.entity.Sesion;
import checkchow.back.seguridad.repository.AuditoriaRepository;
import checkchow.back.seguridad.repository.DispositivoRepository;
import checkchow.back.seguridad.repository.SesionRepository;
import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final SesionRepository sesionRepository;
    private final DispositivoRepository dispositivoRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    @Transactional
    public AuditoriaResponse registrar(AuditoriaRequest request, HttpServletRequest httpRequest) {
        HttpServletRequest resolvedRequest = resolveRequest(httpRequest);
        Auditoria auditoria = new Auditoria();
        Usuario usuario = buscarUsuario(request.getUsuarioId());
        Sesion sesion = resolveSesion(buscarSesion(request.getSesionId()), resolvedRequest);
        if (usuario == null && sesion != null) {
            usuario = sesion.getUsuario();
        }

        auditoria.setUsuario(usuario);
        auditoria.setSesion(sesion);
        auditoria.setAccion(request.getAccion());
        auditoria.setMetodoHttp(request.getMetodoHttp());
        auditoria.setEndpoint(request.getEndpoint());
        auditoria.setEntidad(request.getEntidad());
        auditoria.setEntidadId(request.getEntidadId());
        auditoria.setValorAnterior(request.getValorAnterior());
        auditoria.setValorNuevo(request.getValorNuevo());
        auditoria.setIpOrigen(getClientInetAddress(resolvedRequest));
        auditoria.setUserAgent(getUserAgent(resolvedRequest));
        auditoria.setFecha(OffsetDateTime.now());

        validarAuditoria(auditoria);
        return toResponse(auditoriaRepository.save(auditoria));
    }

    @Transactional
    public Sesion registrarSesion(Usuario usuario, String token, HttpServletRequest request) {
        marcarSesionesExpiradas();
        HttpServletRequest resolvedRequest = resolveRequest(request);
        Dispositivo dispositivo = registrarDispositivo(usuario, resolvedRequest);

        Sesion sesion = new Sesion();
        sesion.setUsuario(usuario);
        sesion.setDispositivo(dispositivo);
        sesion.setToken(token != null && !token.isBlank() ? token : UUID.randomUUID().toString());
        sesion.setActiva(true);
        OffsetDateTime fechaInicio = OffsetDateTime.now();
        sesion.setFechaInicio(fechaInicio);
        sesion.setFechaExpiracion(fechaInicio.plus(Duration.ofMillis(jwtExpirationMs)));

        return sesionRepository.save(sesion);
    }

    @Transactional
    public Dispositivo registrarDispositivo(Usuario usuario, HttpServletRequest request) {
        HttpServletRequest resolvedRequest = resolveRequest(request);
        String userAgent = getUserAgent(resolvedRequest);
        InetAddress ip = getClientInetAddress(resolvedRequest);

        return dispositivoRepository
                .findByUsuarioIdAndUserAgent(usuario.getId(), userAgent)
                .orElseGet(() -> {
                    Dispositivo dispositivo = new Dispositivo();
                    dispositivo.setUsuario(usuario);
                    dispositivo.setSistemaOperativo(detectarSistemaOperativo(userAgent));
                    dispositivo.setUserAgent(userAgent);
                    dispositivo.setIpRegistro(ip);
                    dispositivo.setFechaCreacion(OffsetDateTime.now());
                    return dispositivoRepository.save(dispositivo);
                });
    }

    @Transactional
    public void registrarEvento(Usuario usuario, Sesion sesion, TAccion accion, TMetodoHttp metodoHttp,
            String endpoint, String entidad, String entidadId, String valorNuevo,
            HttpServletRequest request) {
        registrarEvento(usuario, sesion, accion, metodoHttp, endpoint, entidad, entidadId, null, valorNuevo, request);
    }

    @Transactional
    public void registrarEvento(Usuario usuario, Sesion sesion, TAccion accion, TMetodoHttp metodoHttp,
            String endpoint, String entidad, String entidadId, String valorAnterior,
            String valorNuevo, HttpServletRequest request) {
        HttpServletRequest resolvedRequest = resolveRequest(request);
        Sesion resolvedSesion = resolveSesion(sesion, resolvedRequest);
        Usuario resolvedUsuario = usuario != null ? usuario
                : resolvedSesion != null ? resolvedSesion.getUsuario() : null;

        Auditoria auditoria = new Auditoria();
        auditoria.setUsuario(resolvedUsuario);
        auditoria.setSesion(resolvedSesion);
        auditoria.setAccion(accion);
        auditoria.setMetodoHttp(metodoHttp);
        auditoria.setEndpoint(endpoint);
        auditoria.setEntidad(entidad);
        auditoria.setEntidadId(entidadId);
        auditoria.setValorAnterior(valorAnterior);
        auditoria.setValorNuevo(valorNuevo);
        auditoria.setIpOrigen(getClientInetAddress(resolvedRequest));
        auditoria.setUserAgent(getUserAgent(resolvedRequest));
        auditoria.setFecha(OffsetDateTime.now());
        validarAuditoria(auditoria);
        auditoriaRepository.save(auditoria);
    }

    @Transactional
    public void cerrarSesionPorToken(String token, HttpServletRequest request) {
        cerrarSesionPorTokenOUsuario(token, null, request);
    }

    @Transactional
    public void cerrarSesionPorTokenOUsuario(String token, String email, HttpServletRequest request) {
        marcarSesionesExpiradas();

        if (token != null && !token.isBlank()) {
            Sesion sesion = sesionRepository.findByToken(token).orElse(null);
            if (sesion != null) {
                cerrarSesion(sesion, request);
                if (email == null || email.isBlank()) {
                    email = sesion.getUsuario().getEmail();
                }
            }
        }

        if (email == null || email.isBlank()) {
            return;
        }

        sesionRepository.findByUsuarioEmailAndActivaTrueAndFechaCierreIsNull(email.trim().toLowerCase())
                .forEach(sesion -> cerrarSesion(sesion, request));
    }

    @Transactional
    public void marcarSesionesExpiradas() {
        OffsetDateTime now = OffsetDateTime.now();
        sesionRepository.findByActivaTrueAndFechaCierreIsNullAndFechaExpiracionBefore(now)
                .forEach(sesion -> cerrarSesionSinAuditoria(sesion, now));

        sesionRepository.findByTokenStartingWithAndActivaTrueAndFechaCierreIsNull("REGISTRO-")
                .forEach(sesion -> cerrarSesionSinAuditoria(sesion, now));
    }

    private void cerrarSesionSinAuditoria(Sesion sesion, OffsetDateTime fechaCierre) {
        sesion.setActiva(false);
        sesion.setFechaCierre(fechaCierre);
        sesionRepository.save(sesion);
    }

    private void cerrarSesion(Sesion sesion, HttpServletRequest request) {
        if (Boolean.FALSE.equals(sesion.getActiva()) && sesion.getFechaCierre() != null) {
            return;
        }

        Map<String, Object> anterior = new LinkedHashMap<>();
        anterior.put("activa", sesion.getActiva());
        anterior.put("fechaCierre", sesion.getFechaCierre());
        anterior.put("fechaExpiracion", sesion.getFechaExpiracion());
        String valorAnterior = toJson(anterior);

        sesion.setActiva(false);
        sesion.setFechaCierre(OffsetDateTime.now());
        sesionRepository.save(sesion);

        Map<String, Object> nuevo = new LinkedHashMap<>();
        nuevo.put("activa", sesion.getActiva());
        nuevo.put("fechaCierre", sesion.getFechaCierre());
        nuevo.put("fechaExpiracion", sesion.getFechaExpiracion());
        String valorNuevo = toJson(nuevo);

        registrarEvento(sesion.getUsuario(), sesion, TAccion.LOGOUT, TMetodoHttp.POST,
                "/api/auth/logout", "sesion", String.valueOf(sesion.getId()), valorAnterior, valorNuevo, request);
    }

    public String toJson(Map<String, Object> values) {
        return values.entrySet().stream()
                .map(entry -> quote(entry.getKey()) + ":" + toJsonValue(entry.getValue()))
                .collect(Collectors.joining(",", "{", "}"));
    }

    private String toJsonValue(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value.toString();
        }
        if (value instanceof Enum<?> enumValue) {
            return quote(enumValue.name());
        }
        return quote(value.toString());
    }

    private String quote(String value) {
        return "\"" + value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t") + "\"";
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponse> listar() {
        return auditoriaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponse> listarPorUsuario(Long usuarioId) {
        return auditoriaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(this::toResponse)
                .toList();
    }

    public String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public String getUserAgent(HttpServletRequest request) {
        return request != null ? request.getHeader("User-Agent") : null;
    }

    private HttpServletRequest resolveRequest(HttpServletRequest request) {
        if (request != null) {
            return request;
        }
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }

    private Sesion resolveSesion(Sesion sesion, HttpServletRequest request) {
        if (sesion != null) {
            return sesion;
        }
        String token = getBearerToken(request);
        if (token == null) {
            return null;
        }
        return sesionRepository.findByToken(token).orElse(null);
    }

    private String getBearerToken(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        return token.isBlank() ? null : token;
    }

    private InetAddress getClientInetAddress(HttpServletRequest request) {
        String ip = getClientIp(request);
        if (ip == null || ip.isBlank()) {
            return null;
        }
        try {
            return InetAddress.getByName(ip);
        } catch (UnknownHostException e) {
            return null;
        }
    }

    private Usuario buscarUsuario(Long usuarioId) {
        if (usuarioId == null) {
            return null;
        }
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuarioId));
    }

    private Sesion buscarSesion(Integer sesionId) {
        if (sesionId == null) {
            return null;
        }
        return sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesion no encontrada con id: " + sesionId));
    }

    private void validarAuditoria(Auditoria auditoria) {
        if (auditoria.getAccion() == null) {
            throw new IllegalArgumentException("La accion de auditoria es obligatoria");
        }
        if (auditoria.getMetodoHttp() == null) {
            throw new IllegalArgumentException("El metodo HTTP de auditoria es obligatorio");
        }
        if (isBlank(auditoria.getEndpoint())) {
            throw new IllegalArgumentException("El endpoint de auditoria es obligatorio");
        }
        if (isBlank(auditoria.getEntidad())) {
            throw new IllegalArgumentException("La entidad de auditoria es obligatoria");
        }
        if (isBlank(auditoria.getValorNuevo())) {
            throw new IllegalArgumentException("valor_nuevo de auditoria es obligatorio");
        }
        if (requiereValorAnterior(auditoria.getAccion()) && isBlank(auditoria.getValorAnterior())) {
            throw new IllegalArgumentException("valor_anterior es obligatorio para acciones UPDATE y DELETE");
        }
    }

    private boolean requiereValorAnterior(TAccion accion) {
        return accion == TAccion.UPDATE || accion == TAccion.DELETE;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String detectarSistemaOperativo(String userAgent) {
        if (userAgent == null) {
            return "Desconocido";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("windows")) {
            return "Windows";
        }
        if (ua.contains("android")) {
            return "Android";
        }
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("mac os")) {
            return "Apple";
        }
        if (ua.contains("linux")) {
            return "Linux";
        }
        return "Desconocido";
    }

    private AuditoriaResponse toResponse(Auditoria auditoria) {
        AuditoriaResponse response = new AuditoriaResponse();
        response.setId(auditoria.getId());
        response.setUsuarioId(auditoria.getUsuario() != null ? auditoria.getUsuario().getId() : null);
        response.setSesionId(auditoria.getSesion() != null ? auditoria.getSesion().getId() : null);
        response.setAccion(auditoria.getAccion());
        response.setMetodoHttp(auditoria.getMetodoHttp());
        response.setEndpoint(auditoria.getEndpoint());
        response.setEntidad(auditoria.getEntidad());
        response.setEntidadId(auditoria.getEntidadId());
        response.setValorAnterior(auditoria.getValorAnterior());
        response.setValorNuevo(auditoria.getValorNuevo());
        response.setIpOrigen(auditoria.getIpOrigen() != null ? auditoria.getIpOrigen().getHostAddress() : null);
        response.setUserAgent(auditoria.getUserAgent());
        response.setFecha(auditoria.getFecha());
        return response;
    }
}
