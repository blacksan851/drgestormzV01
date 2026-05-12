import { Layout } from "../components/Layout";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users_count: number;
}

export function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setRoles(data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  }

  const allPermissions = [
    { id: "all", label: "Acesso Total (Admin)" },
    { id: "pos_access", label: "Acesso ao POS" },
    { id: "inventory_read", label: "Visualizar Inventário" },
    { id: "inventory_write", label: "Gerir Inventário" },
    { id: "sales_read", label: "Visualizar Relatórios" }
  ];

  const getPermissionLabel = (id: string) => {
    const perm = allPermissions.find(p => p.id === id);
    return perm ? perm.label : id;
  };

  const togglePermission = (id: string) => {
    setNewRole(prev => {
      if (prev.permissions.includes(id)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== id) };
      }
      return { ...prev, permissions: [...prev.permissions, id] };
    });
  };

  const handleCreateOrUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) return;

    try {
      setIsSubmitting(true);
      if (editingId) {
        const { error } = await supabase
          .from('roles')
          .update({
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions
          })
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('roles')
          .insert([{
            name: newRole.name,
            description: newRole.description,
            permissions: newRole.permissions,
            users_count: 0
          }]);
        
        if (error) throw error;
      }
      
      await fetchRoles();
      setIsModalOpen(false);
      setNewRole({ name: '', description: '', permissions: [] });
      setEditingId(null);
    } catch (error) {
      console.error("Error creating/updating role:", error);
      alert("Erro ao guardar cargo. Talvez o nome já exista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (role: Role) => {
    setEditingId(role.id);
    setNewRole({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewRole({ name: '', description: '', permissions: [] });
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm("Tem a certeza que deseja eliminar este cargo?")) return;
    
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRoles(roles.filter(role => role.id !== id));
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Erro ao eliminar cargo.");
    }
  };

  return (
    <Layout title="Cargos e Permissões">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Gestão de Acessos</h2>
          <p className="text-on-surface-variant font-medium">Defina os níveis de acesso para os colaboradores do DR GESTOR MZ.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold shadow-sm hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Novo Cargo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col">
              <div className="p-5 border-b border-outline-variant/30 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-on-surface">{role.name}</h3>
                  <p className="text-sm text-on-surface-variant line-clamp-1">{role.description}</p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleEditClick(role)}
                     className="text-on-surface-variant hover:text-primary transition-colors h-8 w-8 rounded hover:bg-primary/10 flex items-center justify-center"
                   >
                     <span className="material-symbols-outlined text-[18px]">edit</span>
                   </button>
                   <button 
                     onClick={() => handleDeleteRole(role.id)}
                     className="text-on-surface-variant hover:text-error transition-colors h-8 w-8 rounded hover:bg-error/10 flex items-center justify-center"
                   >
                     <span className="material-symbols-outlined text-[18px]">delete</span>
                   </button>
                </div>
              </div>
              <div className="p-5 flex-1">
                 <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px] text-primary">key</span>
                   Permissões
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {role.permissions.map((perm) => (
                     <span key={perm} className="px-2.5 py-1 bg-surface-container text-on-surface text-xs rounded-lg font-medium border border-outline-variant/30">
                       {getPermissionLabel(perm)}
                     </span>
                   ))}
                 </div>
              </div>
              <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">group</span>
                   {role.users_count} {role.users_count === 1 ? 'utilizador' : 'utilizadores'}
                </span>
                <button className="text-primary font-bold hover:underline">Ver Utilizadores</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Novo Cargo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest rounded-t-2xl">
              <h2 className="text-xl font-bold text-on-surface">{editingId ? 'Editar Cargo' : 'Adicionar Novo Cargo'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateRole} className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Nome do Cargo <span className="text-error">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    placeholder="Ex: Gestor de Stocks"
                    className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Descrição</label>
                  <textarea 
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    placeholder="Breve descrição sobre as responsabilidades deste cargo..."
                    rows={3}
                    className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-3">Permissões do Sistema</label>
                  <div className="space-y-2">
                    {allPermissions.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-3 p-3 border border-outline-variant/50 rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
                        <input 
                          type="checkbox" 
                          checked={newRole.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                        />
                        <span className="font-medium text-on-surface">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </form>
            
            <div className="p-6 border-t border-outline-variant/30 flex justify-end gap-3 bg-surface-container-lowest rounded-b-2xl">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-on-surface-variant font-bold hover:bg-surface-container rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleCreateOrUpdateRole}
                disabled={isSubmitting || !newRole.name}
                className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  editingId ? 'Guardar Alterações' : 'Adicionar Cargo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
