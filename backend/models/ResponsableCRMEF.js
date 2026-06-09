
class ResponsableCRMEF {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM responsables_crmef');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM responsables_crmef WHERE Id_CRMEF = ?', [id]);
    return rows[0];
  }

  static async login(password) {
    const [rows] = await db.query(
      'SELECT * FROM responsables_crmef WHERE Password = ?',
      [password]
    );
    return rows[0] || null;
  }

  // Grant an etablissement account
  static async grantEtabAcc(etablissementId) {
    const [result] = await db.query(
      'UPDATE etablissements SET is_active = 1 WHERE Id_Etablissement = ?',
      [etablissementId]
    );
    return result.affectedRows > 0;
  }

  // Grant a supervisor account
  static async grantSupAcc(superviseurId) {
    const [result] = await db.query(
      'UPDATE superviseurs_crmef SET is_active = 1 WHERE Id_Superviseur = ?',
      [superviseurId]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM responsables_crmef WHERE Id_CRMEF = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ResponsableCRMEF;