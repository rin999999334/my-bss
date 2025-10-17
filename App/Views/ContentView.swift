import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: TeamStore
    @State private var showingAttackEditor = false

    var body: some View {
        NavigationStack {
            List {
                Section("Teams") {
                    ForEach($store.teams) { $team in
                        NavigationLink {
                            TeamEditor(team: $team)
                        } label: {
                            HStack {
                                Text(team.displayName)
                                Spacer()
                                if store.baseTeamID == team.id {
                                    Label("Base", systemImage: "star.fill")
                                        .labelStyle(.iconOnly)
                                        .foregroundStyle(.yellow)
                                        .accessibilityLabel("Base team")
                                }
                            }
                        }
                        .contextMenu {
                            Button {
                                store.baseTeamID = team.id
                            } label: {
                                Label("Set as Base", systemImage: "star")
                            }
                        }
                    }
                    .onDelete(perform: store.removeTeams)
                    .onMove(perform: store.moveTeams)

                    Button {
                        store.addTeam()
                    } label: {
                        Label("Add Team", systemImage: "plus")
                    }
                }

                Section("Configuration") {
                    Button {
                        showingAttackEditor = true
                    } label: {
                        Label("Edit Attack Routes", systemImage: "arrow.right.arrow.left")
                    }

                    Picker("Base Team", selection: Binding(
                        get: { store.baseTeamID ?? store.teams.first?.id },
                        set: { newValue in store.baseTeamID = newValue }
                    )) {
                        ForEach(store.teams) { team in
                            Text(team.displayName).tag(Optional(team.id))
                        }
                    }
                }
            }
            .navigationTitle("Sukumi")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
            }
            .sheet(isPresented: $showingAttackEditor) {
                NavigationStack {
                    AttackConfigEditor()
                }
                .environmentObject(store)
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(TeamStore())
}
