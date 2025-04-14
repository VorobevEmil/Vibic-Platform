﻿// <auto-generated />
using System;
using ChatChannelService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ChatChannelService.Infrastructure.Data.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("ChatChannelService.Core.Entities.Channel", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<Guid?>("ServerId")
                        .HasColumnType("uuid");

                    b.Property<int>("Type")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("ServerId");

                    b.ToTable("Channels");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ChannelMember", b =>
                {
                    b.Property<Guid>("ChannelId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("ChannelId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("ChannelMembers");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ChatUser", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("boolean");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.HasKey("Id");

                    b.ToTable("ChatUsers");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.Message", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("ChannelId")
                        .HasColumnType("uuid");

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasMaxLength(2000)
                        .HasColumnType("character varying(2000)");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("boolean");

                    b.Property<Guid>("SenderId")
                        .HasColumnType("uuid");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("ChannelId");

                    b.HasIndex("SenderId");

                    b.ToTable("Messages");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.Server", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<Guid>("OwnerId")
                        .HasColumnType("uuid");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.ToTable("Servers");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ServerMember", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("ChatUserId")
                        .HasColumnType("uuid");

                    b.Property<string>("DisplayName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<Guid>("ServerId")
                        .HasColumnType("uuid");

                    b.HasKey("Id");

                    b.HasIndex("ChatUserId");

                    b.HasIndex("ServerId");

                    b.ToTable("ServerMembers");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ServerRole", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<int>("Priority")
                        .HasColumnType("integer");

                    b.Property<Guid>("ServerId")
                        .HasColumnType("uuid");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("ServerId");

                    b.ToTable("ServerRole");
                });

            modelBuilder.Entity("ServerMemberServerRole", b =>
                {
                    b.Property<Guid>("ServerMembersId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("ServerRolesId")
                        .HasColumnType("uuid");

                    b.HasKey("ServerMembersId", "ServerRolesId");

                    b.HasIndex("ServerRolesId");

                    b.ToTable("ServerMemberServerRole");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.Channel", b =>
                {
                    b.HasOne("ChatChannelService.Core.Entities.Server", "Server")
                        .WithMany("Channels")
                        .HasForeignKey("ServerId");

                    b.Navigation("Server");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ChannelMember", b =>
                {
                    b.HasOne("ChatChannelService.Core.Entities.Channel", "Channel")
                        .WithMany("ChannelMembers")
                        .HasForeignKey("ChannelId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ChatChannelService.Core.Entities.ChatUser", "User")
                        .WithMany("ChannelMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Channel");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.Message", b =>
                {
                    b.HasOne("ChatChannelService.Core.Entities.Channel", "Channel")
                        .WithMany("Messages")
                        .HasForeignKey("ChannelId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ChatChannelService.Core.Entities.ChatUser", "ChatUser")
                        .WithMany("Messages")
                        .HasForeignKey("SenderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Channel");

                    b.Navigation("ChatUser");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ServerMember", b =>
                {
                    b.HasOne("ChatChannelService.Core.Entities.ChatUser", "ChatUser")
                        .WithMany("ServerMembers")
                        .HasForeignKey("ChatUserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ChatChannelService.Core.Entities.Server", "Server")
                        .WithMany("ServerMembers")
                        .HasForeignKey("ServerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ChatUser");

                    b.Navigation("Server");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ServerRole", b =>
                {
                    b.HasOne("ChatChannelService.Core.Entities.Server", "Server")
                        .WithMany("ServerRoles")
                        .HasForeignKey("ServerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Server");
                });

            modelBuilder.Entity("ServerMemberServerRole", b =>
                {
                    b.HasOne("ChatChannelService.Core.Entities.ServerMember", null)
                        .WithMany()
                        .HasForeignKey("ServerMembersId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ChatChannelService.Core.Entities.ServerRole", null)
                        .WithMany()
                        .HasForeignKey("ServerRolesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.Channel", b =>
                {
                    b.Navigation("ChannelMembers");

                    b.Navigation("Messages");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.ChatUser", b =>
                {
                    b.Navigation("ChannelMembers");

                    b.Navigation("Messages");

                    b.Navigation("ServerMembers");
                });

            modelBuilder.Entity("ChatChannelService.Core.Entities.Server", b =>
                {
                    b.Navigation("Channels");

                    b.Navigation("ServerMembers");

                    b.Navigation("ServerRoles");
                });
#pragma warning restore 612, 618
        }
    }
}
